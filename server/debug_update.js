import { Task } from './models/index.js';

async function debugUpdate() {
  try {
    const task = await Task.findByPk('0fc3a801-c4cf-43dc-875b-5fb0fd6f030f');
    if (!task) {
      console.log('Task not found');
      process.exit(1);
    }
    
    console.log('=== CURRENT TASK STATE ===');
    console.log('status:', task.status);
    console.log('taskType:', task.taskType);
    console.log('assigneeId:', task.assigneeId);
    console.log('teamId:', task.teamId);
    console.log('internalAssigneeId:', task.internalAssigneeId);
    
    console.log('\n=== ATTEMPTING STATUS UPDATE TO in-review ===');
    task.status = 'in-review';
    await task.save();
    console.log('SUCCESS! Task status updated to:', task.status);
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Full:', error);
  }
  process.exit(0);
}

debugUpdate();
