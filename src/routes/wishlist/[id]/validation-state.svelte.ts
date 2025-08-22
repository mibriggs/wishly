interface ValidationState {
    nameError: string;
    urlError: string;
    quantityError: string;
    costError: string;

    hasFirstInteraction: boolean;
    disabled: boolean;

    validateName: (name: string) => void;
    validateUrl: (url: string) => void;
    validateCost: (cost: number | undefined) => void;
    updateErrors: (errorDetails: Record<string, any>) => void;
    reset: () => void;
};

class ValidationStateClass {
    
}