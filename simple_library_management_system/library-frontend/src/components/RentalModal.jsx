import { useState, useEffect } from 'react';

export default function RentalModal({ onConfirm, onClose }) {
    const [months, setMonths] = useState(0);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        // Reset when modal opens
        setMonths(0);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
    }, []);

    const safeParse = (value) => {
        const num = parseInt(value);
        return isNaN(num) ? 0 : num;
    };

    const handleConfirm = () => {
        const totalSeconds =
            safeParse(months) * 30 * 24 * 60 * 60 + // 30 days/month assumption
            safeParse(days) * 24 * 60 * 60 +
            safeParse(hours) * 60 * 60 +
            safeParse(minutes) * 60 +
            safeParse(seconds);

        if (totalSeconds <= 0) {
            alert('Please enter a valid duration.');
            return;
        }

        onConfirm(totalSeconds);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-lg font-bold mb-4 text-center">Select Rental Duration</h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    <DurationInput label="Months" value={months} setValue={setMonths} />
                    <DurationInput label="Days" value={days} setValue={setDays} />
                    <DurationInput label="Hours" value={hours} setValue={setHours} max={23} />
                    <DurationInput label="Minutes" value={minutes} setValue={setMinutes} max={59} />
                    <DurationInput label="Seconds" value={seconds} setValue={setSeconds} max={59} />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

function DurationInput({ label, value, setValue, max }) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                type="number"
                value={value}
                min={0}
                max={max}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                className="border px-2 py-1 w-full rounded"
            />
        </div>
    );
}
