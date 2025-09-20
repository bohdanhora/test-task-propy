import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/Task";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./ui/checkbox";

interface TaskCardProps {
    task: Task;
    editingTask: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onToggle: () => void;
}

export const TaskCard = ({ task, editingTask, onDelete, onEdit, onToggle }: TaskCardProps) => {
    const { title, description, priority, dueDate, completed } = task;

    const priorityColor = {
        high: "text-red-600 bg-red-100",
        medium: "text-yellow-600 bg-yellow-100",
        low: "text-green-600 bg-green-100",
    };

    function formatDateToMMDDYY(date: Date | string): string {
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) return "No date";

        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);

        return `${month}/${day}/${year}`;
    }

    return (
        <Card className="px-5 py-4 relative hover:shadow-lg transition-shadow duration-300 border border-border rounded-lg">
            {/* Completion checkbox */}
            <Checkbox checked={completed} onCheckedChange={onToggle} className="absolute top-4 right-4" />

            {/* Task Info */}
            <div className="flex flex-col gap-2">
                <h3 className={twMerge("text-xl font-semibold", completed ? "line-through text-muted-foreground" : "")}>
                    {title}
                </h3>

                {description && (
                    <p className={twMerge("text-sm text-muted-foreground", completed ? "line-through" : "")}>
                        {description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={twMerge(
                            "px-2 py-1 rounded-full font-medium text-xs first-letter:uppercase",
                            priorityColor[priority],
                        )}
                    >
                        {priority}
                    </span>
                    {dueDate && (
                        <span className="text-xs text-muted-foreground">Due: {formatDateToMMDDYY(dueDate)}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={onEdit} disabled={editingTask}>
                    Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={onDelete} disabled={editingTask}>
                    Delete
                </Button>
            </div>
        </Card>
    );
};
