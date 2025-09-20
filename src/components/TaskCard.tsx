import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/Task";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./ui/checkbox";
import { formatDateToMMDDYY } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
    editingTask: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onToggle: () => void;
}

const PRIORITY_CLASSES: Record<string, string> = {
    high: "text-red-600 bg-red-100",
    medium: "text-yellow-600 bg-yellow-100",
    low: "text-green-600 bg-green-100",
};

export const TaskCard = ({ task, editingTask, onDelete, onEdit, onToggle }: TaskCardProps) => {
    const { title, description, priority, dueDate, completed } = task;

    return (
        <Card className="relative border border-border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row sm:justify-between gap-4">
            {/* Left section: Task info */}
            <div className="flex flex-1 flex-col gap-2">
                <h3
                    className={twMerge(
                        "text-lg sm:text-xl font-semibold",
                        completed ? "line-through text-muted-foreground" : "",
                    )}
                >
                    {title}
                </h3>

                {description && (
                    <p className={twMerge("text-sm text-muted-foreground", completed ? "line-through" : "")}>
                        {description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                    <span
                        className={twMerge(
                            "px-2 py-1 rounded-full font-medium text-xs first-letter:uppercase",
                            PRIORITY_CLASSES[priority],
                        )}
                    >
                        {priority}
                    </span>
                    {dueDate && (
                        <span className="text-xs text-muted-foreground">Due: {formatDateToMMDDYY(dueDate)}</span>
                    )}
                </div>
            </div>

            {/* Right section: Actions & checkbox */}
            <div className="flex flex-col sm:items-end gap-2 sm:gap-4">
                <Checkbox checked={completed} onCheckedChange={onToggle} />

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button size="sm" variant="outline" onClick={onEdit} disabled={editingTask}>
                        Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onDelete} disabled={editingTask}>
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
};
