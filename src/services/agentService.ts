import { useAgentStore } from '../store/agentStore';
import { Message } from '../store/agentStore';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
  result?: any;
}

interface WorkPlan {
  id: string;
  originalInstruction: string;
  tasks: Task[];
  status: 'planning' | 'executing' | 'testing' | 'completed' | 'failed';
  summary: string[];
}

export class AgentService {
  private currentPlan: WorkPlan | null = null;
  private store: ReturnType<typeof useAgentStore> | null = null;

  constructor() {
    this.initializeStore();
  }

  private initializeStore() {
    // Initialize store reference
    this.store = useAgentStore.getState();
  }

  public async* processInstruction(instruction: string): AsyncGenerator<string> {
    try {
      // Step 1: Understand instruction
      yield '🤖 **Understanding your instruction...**';
      await this.delay(500);

      // Step 2: Create work plan
      yield '\n📋 **Creating work plan...**';
      await this.delay(800);

      const plan = this.createWorkPlan(instruction);
      this.currentPlan = plan;

      yield `\n## Work Plan for: *${instruction}*\n\n`;
      yield '### Tasks Breakdown:\n';

      for (const [index, task] of plan.tasks.entries()) {
        yield `${index + 1}. [ ] ${task.description}\n`;
      }

      await this.delay(1000);

      // Step 3: Execute tasks one by one
      yield '\n🚀 **Executing tasks...**';
      await this.delay(500);

      for (let i = 0; i < plan.tasks.length; i++) {
        const task = plan.tasks[i];
        task.status = 'in-progress';
        yield `\n### Task ${i + 1}: ${task.description}\n`;
        yield `Status: 🟡 In Progress...\n\n`;

        await this.delay(1000);

        try {
          // Execute the task
          const result = await this.executeTask(task, instruction);
          task.result = result;
          task.status = 'completed';

          yield `✅ **Task completed successfully!**\n`;
          yield `Result: ${JSON.stringify(result, null, 2)}\n\n`;

          // Step 4: Test the task result
          yield '🧪 **Testing task result...**\n';
          await this.delay(800);

          const testResult = await this.testTaskResult(task);
          if (testResult.success) {
            yield `✅ **Tests passed!** ${testResult.message}\n\n`;
          } else {
            yield `❌ **Tests failed!** ${testResult.message}\n`;
            yield '🔧 **Attempting to fix errors...**\n';
            await this.delay(1000);

            const fixResult = await this.fixTaskErrors(task, testResult.error || 'Unknown error');
            if (fixResult.success) {
              yield `✅ **Errors fixed successfully!** ${fixResult.message}\n\n`;
              task.status = 'completed';
            } else {
              task.status = 'failed';
              task.error = fixResult.error;
              yield `❌ **Failed to fix errors!** ${fixResult.error}\n\n`;
              plan.status = 'failed';
              break;
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          task.status = 'failed';
          task.error = errorMessage;
          yield `❌ **Task failed!** ${errorMessage}\n\n`;
          plan.status = 'failed';
          break;
        }
      }

      // Step 5: Generate summary
      if (plan.status !== 'failed') {
        plan.status = 'completed';
        yield '📊 **Generating work summary...**\n';
        await this.delay(1000);

        const summary = this.generateSummary(plan);
        plan.summary = summary;

        yield '## 🎉 **Work Summary**\n\n';
        for (const item of summary) {
          yield `- ${item}\n`;
        }

        yield '\n🎯 **All tasks completed successfully!** 🎯';
      } else {
        yield '## ❌ **Work Plan Failed**\n\n';
        yield 'Some tasks encountered errors and could not be completed.\n';
        yield 'Please review the error messages above and try again.\n';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      yield `\n❌ **Critical Error: ** ${errorMessage}\n`;
    }
  }

  private createWorkPlan(instruction: string): WorkPlan {
    const planId = crypto.randomUUID();

    // Simple task breakdown based on instruction analysis
    const tasks: Task[] = [];

    // Analyze instruction to determine tasks
    if (instruction.toLowerCase().includes('create') || instruction.toLowerCase().includes('build')) {
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Analyze requirements and create project structure',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Implement core functionality',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Add error handling and validation',
        status: 'pending'
      });
    } else if (instruction.toLowerCase().includes('fix') || instruction.toLowerCase().includes('error')) {
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Identify and reproduce the issue',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Implement fix for the problem',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Test the fix thoroughly',
        status: 'pending'
      });
    } else {
      // Default task breakdown
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Understand and analyze the request',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Implement the requested changes',
        status: 'pending'
      });
      tasks.push({
        id: crypto.randomUUID(),
        description: 'Verify and test the implementation',
        status: 'pending'
      });
    }

    return {
      id: planId,
      originalInstruction: instruction,
      tasks,
      status: 'planning',
      summary: []
    };
  }

  private async executeTask(task: Task, instruction: string): Promise<any> {
    // Simulate task execution based on task description
    await this.delay(1500);

    if (task.description.includes('analyze') || task.description.includes('understand')) {
      return {
        analysis: 'Task requirements analyzed successfully',
        approach: 'Determined optimal implementation strategy'
      };
    } else if (task.description.includes('implement') || task.description.includes('create')) {
      return {
        filesCreated: ['src/newComponent.tsx', 'src/utils/helper.ts'],
        linesOfCode: 125,
        implementation: 'Core functionality implemented'
      };
    } else if (task.description.includes('fix') || task.description.includes('error')) {
      return {
        issueFound: 'Identified root cause of the problem',
        fixApplied: 'Implemented solution for the issue',
        filesModified: ['src/App.tsx']
      };
    } else if (task.description.includes('test') || task.description.includes('verify')) {
      return {
        testsRun: 8,
        testsPassed: 8,
        coverage: '95%'
      };
    }

    // Default execution result
    return {
      action: 'Task executed',
      result: 'Success'
    };
  }

  private async testTaskResult(task: Task): Promise<{ success: boolean; message: string; error?: string }> {
    await this.delay(1000);

    // Simulate testing - 80% success rate for realism
    const shouldFail = Math.random() < 0.2;

    if (shouldFail) {
      return {
        success: false,
        message: 'Tests failed with errors',
        error: 'TypeError: Cannot read property of undefined'
      };
    }

    return {
      success: true,
      message: 'All tests passed successfully'
    };
  }

  private async fixTaskErrors(task: Task, error: string): Promise<{ success: boolean; message: string; error?: string }> {
    await this.delay(1500);

    // Simulate error fixing
    if (error.includes('undefined') || error.includes('null')) {
      return {
        success: true,
        message: 'Fixed null/undefined reference errors',
        error: 'Added proper null checks and default values'
      };
    } else if (error.includes('TypeError')) {
      return {
        success: true,
        message: 'Fixed type-related errors',
        error: 'Corrected type annotations and added type guards'
      };
    }

    // Default fix
    return {
      success: true,
      message: 'Applied general fixes to resolve the issue'
    };
  }

  private generateSummary(plan: WorkPlan): string[] {
    const summary: string[] = [];

    summary.push(`Processed instruction: "${plan.originalInstruction}"`);
    summary.push(`Total tasks: ${plan.tasks.length}`);
    summary.push(`Completed tasks: ${plan.tasks.filter(t => t.status === 'completed').length}`);
    summary.push(`Failed tasks: ${plan.tasks.filter(t => t.status === 'failed').length}`);

    plan.tasks.forEach(task => {
      if (task.status === 'completed') {
        summary.push(`✅ ${task.description}`);
      } else {
        summary.push(`❌ ${task.description} (${task.error || 'Unknown error'})`);
      }
    });

    summary.push('🎯 Work plan execution completed');

    return summary;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const agentService = new AgentService();