import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, Plus, FileText, AlertTriangle } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Task, TaskFormData } from "@/types/Task";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [testStarted, setTestStarted] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
    const [filterCompleted, setFilterCompleted] = useState<"all" | "completed" | "pending">("all");
    const [sortBy, setSortBy] = useState<"none" | "priority" | "dueDate">("none");

    const searchInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();

    const { timeRemaining, isTimeUp, formatTime, startTimer, resetTimer } = useTimer(3600); // 60 minutes

    const priorityOrder: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
    };

    const handleStartTest = () => {
        setTestStarted(true);
        startTimer();
    };

    const handleResetTest = () => {
        setTestStarted(false);
        resetTimer();
        setTasks([]);
        setShowForm(false);
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
        const matchesCompleted =
            filterCompleted === "all" ||
            (filterCompleted === "completed" && task.completed) ||
            (filterCompleted === "pending" && !task.completed);

        return matchesSearch && matchesPriority && matchesCompleted;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "priority") {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
    });

    const onCancel = () => {
        setEditingTask(null);
        setShowForm(false);
    };

    // Add Task
    const handleSubmitTask = (task: TaskFormData & { id?: string }) => {
        const formattedTask = {
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        };

        if (task.id) {
            // Update existing task
            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...formattedTask } : t)));
            toast({ description: "Task updated!" });
        } else {
            // Add new task
            const newTask: Task = {
                ...formattedTask,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                completed: false,
            };
            setTasks((prev) => [...prev, newTask]);
            toast({ description: "Task added!" });
        }

        onCancel();
    };

    // Toggle Complete
    const toggleTask = (id: string) => {
        toast({
            description: "Task completed status changed.",
        });
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
    };

    // Delete Task
    const deleteTask = (id: string) => {
        toast({
            description: "Task deleted",
        });
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const renderTasks = (task: Task) => (
        <TaskCard
            key={task.id}
            task={task}
            editingTask={Boolean(editingTask)}
            onDelete={() => deleteTask(task.id)}
            onEdit={() => {
                setEditingTask(task);
                setShowForm(true);
            }}
            onToggle={() => toggleTask(task.id)}
        />
    );

    useEffect(() => {
        const stored = localStorage.getItem("tasks");
        if (stored) {
            const parsed: Task[] = JSON.parse(stored).map((t: Task) => ({
                ...t,
                createdAt: new Date(t.createdAt),
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            }));
            setTasks(parsed);
        }
    }, []);

    // Save whenever tasks change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + O = add task
            if (e.ctrlKey && e.key.toLowerCase() === "o") {
                e.preventDefault();
                setShowForm(true);
                setEditingTask(null);
            }

            // Ctrl + R = reset test
            if (e.ctrlKey && e.key.toLowerCase() === "r") {
                e.preventDefault();
                handleResetTest();
            }

            // Escape = cancel form
            if (e.key === "Escape" && showForm) {
                e.preventDefault();
                onCancel();
            }

            // Ctrl + S = save task (if form is open)
            if (e.ctrlKey && e.key.toLowerCase() === "s" && showForm) {
                e.preventDefault();
                const form = document.querySelector("form");
                if (form) {
                    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }
            }

            // Ctrl + F = focus search input
            if (e.ctrlKey && e.key.toLowerCase() === "f") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showForm, handleResetTest]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4 md:items-center md:justify-between md:flex-row">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
                                60-Minute Frontend Test
                            </h1>
                            <p className="text-muted-foreground mt-2">Build a Task Management Application</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {!testStarted ? (
                                <Button onClick={handleStartTest} size="lg" className="bg-primary hover:bg-primary/90">
                                    Start Test
                                </Button>
                            ) : (
                                <>
                                    <div
                                        className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                                            timeRemaining <= 300
                                                ? "bg-destructive/20 text-destructive"
                                                : timeRemaining <= 900
                                                ? "bg-warning/20 text-warning"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span>Time Remaining: {formatTime(timeRemaining)}</span>
                                    </div>
                                    <Button onClick={handleResetTest} variant="outline" size="sm">
                                        Reset Test
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Time Up Alert */}
                {isTimeUp && (
                    <Alert className="mb-6 border-destructive bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive font-medium">
                            Time's up! The 60-minute test period has ended. Please stop coding and review your work.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Test Not Started State */}
                {!testStarted && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Card className="max-w-2xl">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Ready to Start Your 60-Minute Test?</CardTitle>
                                <CardDescription className="text-lg">
                                    Once you click "Start Test", the timer will begin and you'll have exactly 60 minutes
                                    to complete the task management application.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">What you'll be building:</h3>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• TaskCard component with proper TypeScript interfaces</li>
                                        <li>• CRUD operations with localStorage persistence</li>
                                        <li>• Validated task form with error handling</li>
                                        <li>• Responsive design with smooth animations</li>
                                        <li>• One advanced feature (search, sort, or drag & drop)</li>
                                    </ul>
                                </div>
                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={handleStartTest}
                                        size="lg"
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Start 60-Minute Test
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Test Content - Only show when test is started */}
                {testStarted && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Requirements Panel */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Test Requirements
                                        </CardTitle>
                                        <CardDescription>Complete these features within 60 minutes</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">✅ Project Setup (5min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Understanding the codebase and technologies
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">🔲 TaskCard Component (15min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Create reusable task display component
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">🔲 State Management (10min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                CRUD operations with localStorage
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">🔲 Task Form (15min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Form with validation and error handling
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">🔲 Styling & UX (10min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Animations, responsive design, accessibility
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">🔲 Advanced Feature (5min)</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Search, sort, or drag & drop
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Application Area */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-semibold">My Tasks</h2>
                                            <p className="text-muted-foreground">
                                                {tasks.length === 0 ? "No tasks yet" : `${tasks.length} tasks`}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => setShowForm(!showForm)}
                                            className="bg-primary hover:bg-primary/90"
                                            disabled={isTimeUp}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Task
                                        </Button>
                                    </div>

                                    {/* TODO: Add TaskForm component here when showForm is true */}
                                    <AnimatePresence>
                                        {showForm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>
                                                            {editingTask ? "Edit Task" : "Add New Task"}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {editingTask
                                                                ? "Update your task details"
                                                                : "Create a new task to manage your work"}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <TaskForm
                                                            onSubmit={handleSubmitTask}
                                                            initialValues={editingTask || null}
                                                            onCancel={onCancel}
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Filters */}
                                    <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
                                        <Input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1"
                                        />

                                        <Select
                                            value={filterPriority}
                                            onValueChange={(value) => setFilterPriority(value as any)}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="All Priorities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={filterCompleted}
                                            onValueChange={(value) => setFilterCompleted(value as any)}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="All Tasks" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Tasks</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Sort By" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Sorting</SelectItem>
                                                <SelectItem value="priority">Priority</SelectItem>
                                                <SelectItem value="dueDate">Due Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Task List */}
                                    <div className="space-y-4">
                                        {tasks.length === 0 ? (
                                            <Card className="border-dashed">
                                                <CardContent className="flex flex-col items-center justify-center py-12">
                                                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                                                    <p className="text-muted-foreground text-center max-w-sm">
                                                        Get started by creating your first task. Click the "Add Task"
                                                        button above.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ) : filteredTasks.length === 0 ? (
                                            <Card className="border-dashed">
                                                <CardContent className="flex flex-col items-center justify-center py-12">
                                                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                                                    <p className="text-muted-foreground text-center max-w-sm">
                                                        Adjust your search or filters to see tasks.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="grid gap-4">
                                                <AnimatePresence>
                                                    {sortedTasks.map((task) => (
                                                        <motion.div
                                                            key={task.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.25 }}
                                                        >
                                                            {renderTasks(task)}
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Footer */}
                        <div className="mt-12 pt-8 border-t border-border">
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold mb-3">Getting Started Instructions:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-medium mb-2">1. Create TypeScript Interfaces</h4>
                                            <p className="text-muted-foreground">
                                                Define the Task interface with proper types
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">2. Build TaskCard Component</h4>
                                            <p className="text-muted-foreground">
                                                Display task info with edit/delete actions
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">3. Implement State Management</h4>
                                            <p className="text-muted-foreground">
                                                CRUD operations with localStorage persistence
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">4. Create Task Form</h4>
                                            <p className="text-muted-foreground">Validated form with error handling</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                                        <p className="text-sm">
                                            <strong>💡 Pro tip:</strong> Focus on functionality first, then polish the
                                            styling. Use the design system tokens (priority.high, priority.medium,
                                            priority.low) for consistent colors.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Index;
