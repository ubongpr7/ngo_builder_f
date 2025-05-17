// Custom styles for react-select components
export const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "36px",
      borderRadius: "0.375rem",
      borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base: any) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: "4px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#e2e8f0" : "transparent",
      color: state.isSelected ? "white" : "inherit",
      padding: "8px 12px",
      cursor: "pointer",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#1e293b",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#e2e8f0",
      borderRadius: "0.25rem",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#1e293b",
      padding: "2px 6px",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#64748b",
      "&:hover": {
        backgroundColor: "#cbd5e1",
        color: "#1e293b",
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
  }
  