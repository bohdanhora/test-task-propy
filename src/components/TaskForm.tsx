"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/types/Task";
import { CustomDatePicker } from "./ui/date-picker";

const formSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(100, { message: "Title cannot exceed 100 characters" }),
    description: z.string().max(500, { message: "Description cannot exceed 500 characters" }).optional(),
    priority: z.enum(["high", "medium", "low"], {
        required_error: "Select a priority",
    }),
    dueDate: z.string().min(1, { message: "Due date is required" }),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
    onSubmit?: (data: TaskFormValues & { id?: string }) => void;
    initialValues?: Task | null;
    onCancel?: () => void;
}

export const TaskForm = ({ initialValues, onSubmit, onCancel }: TaskFormProps) => {
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
        },
    });

    useEffect(() => {
        if (initialValues) {
            form.reset({
                title: initialValues.title,
                description: initialValues.description ?? "",
                priority: initialValues.priority,
                dueDate: initialValues.dueDate ? initialValues.dueDate.toISOString().split("T")[0] : "",
            });
        }
    }, [initialValues, form]);

    const handleSubmit = (values: TaskFormValues) => {
        onSubmit?.({
            ...values,
            id: initialValues?.id,
            dueDate: values.dueDate,
        });

        form.reset();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
                aria-label={initialValues ? "Update task form" : "Add new task form"}
            >
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="task-title">
                                Title
                                <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="task-title"
                                    placeholder="Task title..."
                                    aria-required="true"
                                    aria-label="Task title"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="task-desc">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    id="task-desc"
                                    placeholder="Task description..."
                                    aria-label="Task description"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Priority */}
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="task-priority">
                                Priority <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger
                                        id="task-priority"
                                        aria-required="true"
                                        aria-label="Select task priority"
                                    >
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Due Date */}
                <FormField
                    control={form.control}
                    name="dueDate"
                    render={() => <CustomDatePicker name="dueDate" control={form.control} label="Due Date" required />}
                />

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        type="submit"
                        disabled={!form.formState.isValid}
                        aria-label={initialValues ? "Update task" : "Add task"}
                    >
                        {initialValues ? "Update Task" : "Add Task"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                            onCancel?.();
                        }}
                        aria-label="Cancel task form"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
