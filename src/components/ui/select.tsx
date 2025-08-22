"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({
  value,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child, {
            value,
            defaultValue,
            onValueChange,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

interface SelectTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  size?: "sm" | "default";
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onValueChange,
      size = "default",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(
      value || defaultValue
    );

    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    const handleSelect = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      setIsOpen(false);
    };

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            size === "default" ? "h-9" : "h-8",
            className
          )}
          {...props}
        >
          <span className="line-clamp-1 flex items-center gap-2">
            {selectedValue || children}
          </span>
          <ChevronDown
            className={cn(
              "size-4 opacity-50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <SelectContent onSelect={handleSelect}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectContent) {
                return React.cloneElement(child, {
                  onSelect: handleSelect,
                } as any);
              }
              return null;
            })}
          </SelectContent>
        )}
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectContentProps {
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

const SelectContent = ({ children, onSelect }: SelectContentProps) => {
  return (
    <div className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] origin-top overflow-x-hidden overflow-y-auto rounded-md border shadow-md">
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onSelect } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface SelectItemProps {
  value: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, onSelect, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onSelect?.(value);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
          <Check className="size-4 opacity-0 group-data-[selected]:opacity-100" />
        </span>
        {children}
      </button>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span className="text-muted-foreground">{placeholder}</span>;
};

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const SelectLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}>
      {children}
    </div>
  );
};

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectValue,
  SelectGroup,
  SelectLabel,
};
