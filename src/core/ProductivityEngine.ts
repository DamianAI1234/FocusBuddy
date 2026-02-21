export interface Alert {
    id: string;
    type: 'water' | 'stretch' | 'eyes' | 'break' | 'posture' | 'breath' | 'walk' | 'mindfulness' | 'screen' | 'ergonomics' | 'stand' | 'focus' | 'environment';
    message: string;
    description: string; // Detail about the action
    intervals: { label: string; value: number }[]; // Array of selectable intervals (in seconds)
    defaultIntervalIndex: number; // Index of the primary/recommended interval
}

export const PRODUCTIVITY_RULES: Alert[] = [
    {
        id: 'eye-relief',
        type: 'eyes',
        message: '👀 20-20-20 Rule: Look away!',
        description: 'Look at something 20 feet away for 20 seconds to reduce eye strain.',
        intervals: [
            { label: 'Every 15 mins', value: 15 * 60 },
            { label: 'Every 20 mins', value: 20 * 60 },
            { label: 'Every 30 mins', value: 30 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'posture-check',
        type: 'posture',
        message: '🪑 Posture Check!',
        description: 'Sit up straight, relax your shoulders, and uncross your legs.',
        intervals: [
            { label: 'Every 25 mins', value: 25 * 60 },
            { label: 'Every 45 mins', value: 45 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 }
        ],
        defaultIntervalIndex: 0
    },
    {
        id: 'water-break',
        type: 'water',
        message: '💧 Hydration Time!',
        description: 'Take a sip of water to stay hydrated and focused.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 45 mins', value: 45 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 }
        ],
        defaultIntervalIndex: 0
    },
    {
        id: 'breath-work',
        type: 'breath',
        message: '🌬️ Deep Breath',
        description: 'Take 3 deep breaths. Inhale for 4s, hold for 4s, exhale for 4s.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 50 mins', value: 50 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'stretch-break',
        type: 'stretch',
        message: '🧘 Stretch It Out',
        description: 'Stand up and do a quick stretch to get blood flowing.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 50 mins', value: 50 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'walk-break',
        type: 'walk',
        message: '🚶‍♂️ Short Walk',
        description: 'Walk around the room for 2 minutes.',
        intervals: [
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'long-break',
        type: 'break',
        message: '☕ Break Time',
        description: 'Take a proper 5-minute break. Step away from the screen.',
        intervals: [
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 }
        ],
        defaultIntervalIndex: 2
    },
    {
        id: 'screen-distance',
        type: 'screen',
        message: '📏 Screen Distance',
        description: 'Ensure your screen is at least an arm\'s length away.',
        intervals: [
            { label: 'Every 20 mins', value: 20 * 60 },
            { label: 'Every 40 mins', value: 40 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 }
        ],
        defaultIntervalIndex: 0
    },
    {
        id: 'mindful-checkin',
        type: 'mindfulness',
        message: '🧠 Mindful Minute',
        description: 'Close your eyes. Notice 3 things you hear, and release tension in your jaw.',
        intervals: [
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'stand-up',
        type: 'stand',
        message: '🧍 Time to Stand',
        description: 'If you have a standing desk, raise it. Otherwise, stand and work for 10 mins.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 }
        ],
        defaultIntervalIndex: 0
    },
    {
        id: 'ergonomics-check',
        type: 'ergonomics',
        message: '📐 Ergonomics',
        description: 'Are your wrists flat? Are your feet touching the floor? Adjust your chair.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: '478-breathing',
        type: 'breath',
        message: '😮‍💨 4-7-8 Breathing',
        description: 'Inhale for 4s, hold for 7s, exhale for 8s to calm your nervous system.',
        intervals: [
            { label: 'Every 30 mins', value: 30 * 60 },
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 90 mins', value: 90 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'single-task-check',
        type: 'focus',
        message: '🎯 Single-Task Check',
        description: 'Are you multitasking? Close distracting tabs, silence your phone, focus on one thing.',
        intervals: [
            { label: 'Every 20 mins', value: 20 * 60 },
            { label: 'Every 25 mins', value: 25 * 60 },
            { label: 'Every 45 mins', value: 45 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'tidy-workspace',
        type: 'environment',
        message: '🧹 Tidy Space, Tidy Mind',
        description: 'Take 2 minutes to clear your physical and digital workspaces to regain focus.',
        intervals: [
            { label: 'Every 90 mins', value: 90 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 },
            { label: 'Every 180 mins', value: 180 * 60 }
        ],
        defaultIntervalIndex: 1
    },
    {
        id: 'change-scenery',
        type: 'environment',
        message: '🛋️ Change Scenery',
        description: 'Shift your work location briefly if possible to provide novelty and break routine.',
        intervals: [
            { label: 'Every 60 mins', value: 60 * 60 },
            { label: 'Every 120 mins', value: 120 * 60 },
            { label: 'Every 240 mins', value: 240 * 60 }
        ],
        defaultIntervalIndex: 1
    }
];

// Helper to get all rules - EXPORTED EXPLICITLY
export const getAllRules = () => PRODUCTIVITY_RULES;

// We'll update the signature to accept a record of configured intervals instead of just rules.
// elapsedSeconds: the time elapsed on the stopwatch since start
// configuredRules: mapping of ruleId -> { isEnabled: boolean, intervalIndex: number }
export function checkAlerts(elapsedSeconds: number, configuredRules?: Record<string, { isEnabled: boolean, intervalIndex: number }>): Alert[] {
    const activeAlerts = PRODUCTIVITY_RULES.filter(rule => {
        // Find if this rule is enabled
        const config = configuredRules?.[rule.id];

        // If we provided a config object and it's not enabled, skip
        if (configuredRules && !config?.isEnabled) {
            return false;
        }

        // Determine which interval was selected (default to the recommended index if not specified)
        const targetIntervalIndex = config ? config.intervalIndex : rule.defaultIntervalIndex;
        // Make sure it doesn't try to access out of bounds
        const activeInterval = rule.intervals[targetIntervalIndex] || rule.intervals[rule.defaultIntervalIndex];



        // Trigger when the elapsed time hits a multiple of the requested interval value
        return elapsedSeconds > 0 && (elapsedSeconds % activeInterval.value === 0);
    });



    return activeAlerts;
}
