"use client";

import React from "react";
import { Controller, Control } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
    name: string;
    control: Control<any>;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    name,
    control,
    label,
    placeholder,
    required = false,
}) => {
    return (
        <div className="flex flex-col">
            {label && (
                <label htmlFor={name} className="mb-1 font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const selectedDate = field.value ? new Date(field.value) : null;
                    return (
                        <DatePicker
                            id={name}
                            selected={selectedDate}
                            onChange={(date: Date | null) =>
                                field.onChange(date ? date.toISOString().split("T")[0] : "")
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            calendarClassName="bg-white-100 text-black rounded-lg shadow-lg"
                            placeholderText={placeholder || "Select date"}
                            dateFormat="yyyy-MM-dd"
                        />
                    );
                }}
            />
        </div>
    );
};
