// TODO: Complete the Task interface
// Hint: What properties should a task have?

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "high" | "medium" | "low";
    completed: boolean;
    dueDate?: Date;
    createdAt: Date;
}

export type Priority = "high" | "medium" | "low";

export type TaskFormData = {
    // Add form data interface here
};
