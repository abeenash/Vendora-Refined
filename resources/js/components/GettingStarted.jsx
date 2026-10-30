import { Link } from "@inertiajs/react";
import { CheckCircle2, Circle, Rocket, ArrowRight } from "lucide-react";

// First-run panel shown instead of empty cards/charts.
// steps: [{ label, hint, href, done }]
export default function GettingStarted({ title = "Welcome to Vendora!", message, steps }) {
    const next = steps.find((s) => !s.done);

    return (
        <div className="bg-white rounded-xl shadow-md p-8 mt-4">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                    <p className="mt-1 text-gray-500">{message}</p>
                </div>
            </div>

            <ol className="mt-8 space-y-3">
                {steps.map((step, i) => {
                    const isNext = step === next;
                    return (
                        <li key={step.label}>
                            <Link
                                href={step.href}
                                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isNext ? "border-teal-300 bg-teal-50 hover:bg-teal-100" : "border-gray-200 hover:bg-gray-50"}`}
                            >
                                {step.done
                                    ? <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0" />
                                    : <Circle className={`w-6 h-6 shrink-0 ${isNext ? "text-teal-500" : "text-gray-300"}`} />}
                                <div className="flex-1">
                                    <p className={`font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                        {i + 1}. {step.label}
                                    </p>
                                    {!step.done && step.hint && <p className="text-sm text-gray-500">{step.hint}</p>}
                                </div>
                                {isNext && (
                                    <span className="hidden sm:flex items-center gap-1 text-sm font-medium text-teal-700">
                                        Start now <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
