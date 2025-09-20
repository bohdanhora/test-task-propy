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

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
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

export const TaskForm = ({ onSubmit, initialValues, onCancel }: TaskFormProps) => {
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
            dueDate: values.dueDate ? new Date(values.dueDate).toDateString() : "",
        });

        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Task title..." {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Task description..." {...field} />
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
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button type="submit" disabled={!form.formState.isValid}>
                        {initialValues ? "Update Task" : "Add Task"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                            onCancel?.();
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
