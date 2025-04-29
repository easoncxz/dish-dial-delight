import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

export type SearchableSelectOption = {
  value: string;
  label: string;
  leftIcon?: React.ReactNode;
};

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  triggerClassName?: string;
}

export const SearchableSelect = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  disabled = false,
  emptyMessage = "No results found",
  triggerClassName,
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  // Get the selected option's label
  const selectedOption = React.useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  );

  // Filter options based on search query using substring matching
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) {
      return options;
    }
    const lowerCaseInput = inputValue.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(lowerCaseInput)
    );
  }, [options, inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
          disabled={disabled}
        >
          <span className="flex items-center gap-2 overflow-hidden">
            {selectedOption?.leftIcon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-full p-0", className)} 
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput 
            placeholder="Search..." 
            className="h-9" 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setInputValue("");
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {option.leftIcon && <span>{option.leftIcon}</span>}
                    <span>{option.label}</span>
                  </div>
                  {option.value === value && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};