"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { format, isAfter, isBefore } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disableFuture?: boolean;
  disablePast?: boolean;
  yearRange?: [number, number];
  initialFocusDate?: Date;
  className?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  error,
  placeholder = "Select date",
  minDate,
  maxDate,
  disableFuture = false,
  disablePast = false,
  yearRange,
  initialFocusDate,
  className,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);

  const defaultStartYear = minDate ? minDate.getFullYear() : 1900;
  const defaultEndYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 10;

  const [year, setYear] = useState<number>(() => {
    if (value) return value.getFullYear();
    if (initialFocusDate) return initialFocusDate.getFullYear();
    return new Date().getFullYear();
  });

  const [month, setMonth] = useState<number>(() => {
    if (value) return value.getMonth();
    if (initialFocusDate) return initialFocusDate.getMonth();
    return new Date().getMonth();
  });

  const startYear = yearRange ? yearRange[0] : defaultStartYear;
  const endYear = yearRange ? yearRange[1] : defaultEndYear;

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    value: startYear + i,
    label: (startYear + i).toString(),
  }));

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const handleYearChange = (selectedOption: { value: number; label: string } | null) => {
    if (selectedOption) setYear(selectedOption.value);
  };

  const handleMonthChange = (selectedOption: { value: number; label: string } | null) => {
    if (selectedOption) setMonth(selectedOption.value);
  };

  const handlePrevYear = () => year > startYear && setYear(year - 1);
  const handleNextYear = () => year < endYear && setYear(year + 1);

  const handlePrevMonth = () => {
    if (month === 0) {
      if (year > startYear) {
        setMonth(11);
        setYear(year - 1);
      }
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      if (year < endYear) {
        setMonth(0);
        setYear(year + 1);
      }
    } else {
      setMonth(month + 1);
    }
  };

  useEffect(() => {
    if (open && !value && initialFocusDate) {
      setYear(initialFocusDate.getFullYear());
      setMonth(initialFocusDate.getMonth());
    }
  }, [open, value, initialFocusDate]);

  const isYearMonthDisabled = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    return (minDate && isAfter(minDate, lastDayOfMonth)) || 
           (maxDate && isBefore(maxDate, firstDayOfMonth));
  };

  const isPrevYearDisabled = year <= startYear;
  const isNextYearDisabled = year >= endYear;
  const isPrevMonthDisabled = (year === startYear && month === 0) || 
                            isYearMonthDisabled(year, month - 1 < 0 ? 11 : month - 1);
  const isNextMonthDisabled = (year === endYear && month === 11) || 
                            isYearMonthDisabled(year, month + 1 > 11 ? 0 : month + 1);

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      minWidth: '120px',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 70, // Higher than popover's z-index
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#f3f4f6' : 'white',
      color: 'black',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#f3f4f6',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'black',
    }),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        style={{ zIndex: 60 }} // Higher than dialog's z-50
      >
        <div className="p-3 border-b">
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPrevYearDisabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="w-[120px]">
              <Select
                value={{ value: year, label: year.toString() }}
                onChange={handleYearChange}
                options={years}
                styles={selectStyles}
                isSearchable
                menuPlacement="auto"
                components={{ IndicatorSeparator: () => null }}
              />
            </div>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isNextYearDisabled}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPrevMonthDisabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="w-[120px]">
              <Select
                value={{ value: month, label: months[month].label }}
                onChange={handleMonthChange}
                options={months}
                styles={selectStyles}
                isSearchable
                menuPlacement="auto"
                components={{ IndicatorSeparator: () => null }}
              />
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isNextMonthDisabled}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          month={new Date(year, month)}
          onMonthChange={(date) => {
            setMonth(date.getMonth());
            setYear(date.getFullYear());
          }}
          disabled={(date) => {
            if (disableFuture && isAfter(date, new Date())) return true;
            if (disablePast && isBefore(date, new Date())) return true;
            if (minDate && isBefore(date, minDate)) return true;
            if (maxDate && isAfter(date, maxDate)) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}