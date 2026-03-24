import { mockTasks, mockWorkers, POLITICIAN } from '@/data/mock';
import { Task } from '@/types';
import { apiClient } from './apiClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Simulated delay for mock API responses
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function buildSystemContext(): string {
  const total = mockTasks.length;
  const inProgress = mockTasks.filter(t => t.status === 'in-progress');
  const awaiting = mockTasks.filter(t => t.status === 'awaiting-approval');
  const completed = mockTasks.filter(t => t.status === 'completed');
  const overdue = mockTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed');

  return `Current constituency data for ${POLITICIAN.name} (${POLITICIAN.constituency}):

TASKS SUMMARY:
- Total tasks: ${total}
- In Progress: ${inProgress.length}
- Awaiting Approval: ${awaiting.length}
- Completed: ${completed.length}
- Overdue tasks: ${overdue.length}

PENDING APPROVALS:
${awaiting.map(t => `• "${t.title}" by ${t.assignedWorkerName}, Ward: ${t.ward}, Submitted: ${t.completedAt || t.updatedAt}`).join('\n') || '(none)'}

OVERDUE TASKS:
${overdue.map(t => `• "${t.title}" assigned to ${t.assignedWorkerName}, Deadline: ${t.deadline}, Progress: ${t.progress}%`).join('\n') || '(none)'}

WORKERS:
${mockWorkers.map(w => `• ${w.name} — Ward: ${w.ward}, Active: ${w.activeTasks}, Completed: ${w.completedTasks}, Avg: ${w.avgCompletionDays || '?'} days`).join('\n')}`;
}

// ---- Mock AI response generators ----

const MOCK_RESPONSES: Record<string, string> = {
  'overdue': `Based on your current data, here are the most urgent overdue items:\n\n🔴 **Drainage System Repair** — Ward 5 - West\n- Assigned to Rajiv Singh\n- Deadline was March 5, 2026\n- Progress: 0% — Work hasn't started yet\n- **Recommendation:** Contact Rajiv immediately. This is a flooding risk.\n\n⚠️ **Street Light Installation** — Ward 4 - East\n- Assigned to Lakshmi Devi\n- Deadline: March 10, 2026 (approaching)\n- Progress: 40%\n- **Recommendation:** Check if additional resources are needed to meet deadline.`,

  'approval': `You have **1 task** pending your approval:\n\n✅ **Community Park Development** — Ward 3 - South\n- Worker: Suresh Reddy\n- Submitted: Feb 22, 2026\n- Notes: "Park construction complete. Playground equipment installed and pathways paved."\n- **Recommendation:** This looks ready for approval. Suresh has completed all stated deliverables. Consider publishing to the public dashboard since it's a visible community improvement.`,

  'performance': `Here's your team performance summary:\n\n🏆 **Top Performer: Priya Patel**\n- 18 tasks completed, Avg 5 days — Fastest on the team\n- Currently handling Water Pipeline (65%) and School Renovation (30%)\n\n👍 **Lakshmi Devi** — 22 completed, Avg 6 days\n- Reliable and consistent. Only 1 active task currently.\n\n📊 **Amit Sharma** — 12 completed, Avg 8 days\n- Solid output. 3 active tasks is manageable.\n\n⚠️ **Suresh Reddy** — 9 completed, Avg 12 days\n- Slowest completion time. Had 1 rejection (Health Camp). May need closer oversight.\n\n⚠️ **Rajiv Singh** — 15 completed, Avg 9 days\n- Good track record but Drainage task at 0% is concerning.`,

  'feedback': `Here's a template you can use for rejection feedback:\n\n---\n\n**Task:** [Task Name]\n**Decision:** Requires Revision\n\nDear [Worker Name],\n\nThank you for your work on this task. After review, I've identified the following areas that need attention before approval:\n\n1. **[Specific issue]** — [What needs to change]\n2. **[Missing documentation]** — [What's needed]\n\nPlease address these points and resubmit. Feel free to reach out if you need clarification.\n\nRegards,\n${POLITICIAN.name}\n\n---\n\nWould you like me to customize this for a specific task?`,
};

function getDefaultResponse(message: string, detailed = false): string {
  const lower = message.toLowerCase();

  if (detailed || lower.includes('overdue') || lower.includes('urgent') || lower.includes('delayed')) return MOCK_RESPONSES['overdue'];
  if (detailed || lower.includes('approval') || lower.includes('pending') || lower.includes('approve')) return MOCK_RESPONSES['approval'];
  if (detailed || lower.includes('perform') || lower.includes('team')) return MOCK_RESPONSES['performance'];
  if (detailed || lower.includes('feedback') || lower.includes('reject') || lower.includes('write')) return MOCK_RESPONSES['feedback'];

  // Short default
  return `You have ${mockTasks.filter(t => t.status === 'in-progress').length} tasks in progress and ${mockTasks.filter(t => t.status === 'awaiting-approval').length} awaiting approval. Ask me about overdue tasks, worker performance, or pending approvals for details.`;
}

// ---- Public API ----

/**
 * Send a message to the AI Copilot
 * Calls: POST /api/v1/copilot/chat
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  _context?: Record<string, unknown>
): Promise<{ reply: string }> {
  try {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const messageContent = lastUserMsg?.content || '';

    // Determine if user is requesting detail
    const wantsDetail = /\b(detail|explain|full|list|elaborate|describe|breakdown|summarize)\b/i.test(messageContent);

    // System instruction for conciseness injected as history prefix
    const systemInstruction = wantsDetail
      ? 'You are a helpful AI assistant for a politician dashboard. The user is requesting detailed information — provide a thorough, structured response.'
      : 'You are a helpful AI assistant for a politician dashboard. Be concise and conversational. Reply in 2-4 short sentences unless the user asks for details or uses words like explain, list, or describe. Do not include unsolicited bullet points or headers.';

    const historyWithSystem = [
      { role: 'assistant' as const, content: systemInstruction },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];
    
    const response = await apiClient.sendCopilotMessage(
      messageContent,
      historyWithSystem,
      'general'
    );

    if (response.data?.response) {
      return { reply: response.data.response };
    }

    // Fallback to mock response if API fails
    await delay(1200 + Math.random() * 800);
    return { reply: getDefaultResponse(messageContent, wantsDetail) };
  } catch (error) {
    console.error('Chat error:', error);
    await delay(1200 + Math.random() * 800);
    const lastMsg = messages[messages.length - 1]?.content || '';
    const wantsDetail = /\b(detail|explain|full|list|elaborate|describe|breakdown|summarize)\b/i.test(lastMsg);
    return { reply: getDefaultResponse(lastMsg, wantsDetail) };
  }
}

/**
 * Get AI insights for a specific page
 * Falls back to mock data if real API not available
 */
export async function getAIInsights(
  page: string,
  _context?: Record<string, unknown>
): Promise<{ suggestions: string[] }> {
  await delay(800 + Math.random() * 400);

  const overdue = mockTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed');

  const insightsMap: Record<string, string[]> = {
    dashboard: [
      `You have ${mockTasks.filter(t => t.status === 'awaiting-approval').length} task(s) awaiting your approval — oldest submitted ${mockTasks.find(t => t.status === 'awaiting-approval')?.completedAt || 'recently'}.`,
      overdue.length > 0
        ? `⚠️ ${overdue.length} task(s) are past deadline. The Drainage System Repair in Ward 5 is at 0% and needs immediate attention.`
        : '✅ No overdue tasks — all work is on track.',
      `Priya Patel is your top performer this month with a 5-day average completion time.`,
    ],
    approvals: [
      `Community Park Development has been pending approval for ${Math.round((Date.now() - new Date('2026-02-22').getTime()) / (1000 * 60 * 60 * 24))} days — consider reviewing soon.`,
      `Worker Suresh Reddy has a 12-day avg completion time. His previous task was rejected — review this submission carefully.`,
      `This task includes completion notes — "Playground equipment installed and pathways paved."`,
    ],
    'active-works': [
      overdue.length > 0 ? `🔴 ${overdue.length} task(s) overdue: ${overdue.map(t => t.title).join(', ')}` : '✅ All tasks are on schedule.',
      `Street Light Installation in Ward 4 is at 40% with a March 10 deadline — may need extra resources.`,
      `Water Pipeline Extension is progressing well at 65% — on track for March 15 deadline.`,
    ],
    analytics: [
      `Your overall approval rate is ${Math.round((mockTasks.filter(t => t.status === 'completed').length / Math.max(1, mockTasks.filter(t => t.status === 'completed').length + mockTasks.filter(t => t.status === 'rejected').length)) * 100)}% — above constituency average.`,
      `Ward 1 - Central has the most completed tasks (3). Consider assigning more work to underutilized wards.`,
      `Average task completion time is trending downward — good sign of improving efficiency.`,
    ],
  };

  return { suggestions: insightsMap[page] || insightsMap['dashboard'] };
}

export async function getTaskAISuggestions(
  taskId: string
): Promise<{ suggestions: string[] }> {
  await delay(600 + Math.random() * 400);

  const task = mockTasks.find(t => t.id === taskId);
  if (!task) return { suggestions: ['Task not found.'] };

  const worker = mockWorkers.find(w => w.id === task.assignedWorker);
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const daysToDeadline = Math.round((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const suggestions: string[] = [];

  if (isOverdue) {
    suggestions.push(`⚠️ This task is ${Math.abs(daysToDeadline)} days overdue — consider sending a reminder to ${task.assignedWorkerName}.`);
  } else if (daysToDeadline <= 7 && task.progress < 80) {
    suggestions.push(`⏰ Deadline in ${daysToDeadline} days but progress is at ${task.progress}% — may need additional support.`);
  }

  if (worker) {
    const rate = worker.completedTasks > 0
      ? Math.round((worker.completedTasks / (worker.completedTasks + worker.activeTasks)) * 100)
      : 0;
    suggestions.push(`${worker.name} has a ${rate}% completion rate with avg ${worker.avgCompletionDays || '?'} days per task.`);
  }

  if (task.status === 'awaiting-approval' && task.workerNotes) {
    suggestions.push(`Proof submitted with notes: "${task.workerNotes.slice(0, 80)}…" — review and decide.`);
  }

  if (suggestions.length === 0) {
    suggestions.push(`This task is progressing normally at ${task.progress}%.`);
  }

  return { suggestions };
}

export async function getApprovalAIReview(
  taskId: string
): Promise<{ review: string }> {
  await delay(1000 + Math.random() * 500);

  const task = mockTasks.find(t => t.id === taskId);
  if (!task) return { review: 'Task not found.' };

  const worker = mockWorkers.find(w => w.id === task.assignedWorker);
  const completionRate = worker
    ? Math.round((worker.completedTasks / Math.max(1, worker.completedTasks + worker.activeTasks)) * 100)
    : 0;

  const daysInProgress = task.completedAt && task.createdAt
    ? Math.round((new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : '?';

  let review = `Based on the submission, ${task.assignedWorkerName} completed this task in ${daysInProgress} days. `;
  review += `Worker has a ${completionRate}% historical completion rate (avg ${worker?.avgCompletionDays || '?'} days). `;

  if (task.workerNotes) {
    review += `Notes indicate: "${task.workerNotes}" `;
  }

  review += `\n\n**Recommendation:** `;
  if (completionRate >= 80) {
    review += `Approve — worker has strong track record and the submission details look complete.`;
  } else {
    review += `Review carefully — worker's completion rate (${completionRate}%) suggests some previous issues. Verify proof images if available.`;
  }

  return { review };
}





