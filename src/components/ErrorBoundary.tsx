import React from "react";

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: any) {
        // TODO: ارسال به سرویس لاگینگ
        console.error("Uncaught error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return <div>متأسفیم — خطایی رخ داد. لطفاً صفحه را رفرش کنید.</div>;
        }
        return this.props.children;
    }
}
