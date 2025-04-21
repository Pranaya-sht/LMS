import { motion } from 'framer-motion';

const Background = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Animated vibrant gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />

            {/* Floating, glowing bubbles */}
            {[...Array(15)].map((_, i) => {
                const size = Math.random() * 80 + 60; // 60–140px
                const duration = Math.random() * 4 + 6; // 6–10s
                const offsetY = Math.random() * 200 - 100; // Y drift range
                const offsetX = Math.random() * 80 - 40;  // X drift range

                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white opacity-30 shadow-lg"
                        style={{
                            width: size,
                            height: size,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, offsetY],
                            x: [0, offsetX],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                        }}
                    />
                );
            })}
        </div>
    );
};

export default Background;
