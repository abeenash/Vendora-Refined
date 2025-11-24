import { motion } from "framer-motion";
import dashboard1 from "../images/dash1.png";
import dashboard2 from "../images/dash2.png";
import dashboard3 from "../images/dash3.png";

const IndexPage = () => {
    const features = [
        {
            title: "Smart Inventory Tracking",
            desc: "Stay on top of your stock levels in real-time. Get alerts when inventory runs low.",
        },
        {
            title: "Sales Analytics",
            desc: "Visualize your sales performance with beautiful charts and reports.",
        },
        {
            title: "Customer Management",
            desc: "Keep track of your customers and their purchase history effortlessly.",
        },
    ];

    return (
        <div className="bg-white text-gray-800">
            {/* Header */}
            <motion.header
                className="fixed mt-3 left-70 z-50"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <motion.div
                    className="text-3xl font-extrabold tracking-wide flex space-x-1 text-teal-600"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.05 } },
                    }}
                >
                    {"Vendora".split("").map((char, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                hidden: { y: -20, opacity: 0 },
                                visible: { y: 0, opacity: 1 },
                            }}
                            transition={{ duration: 0.4 }}
                            className="hover:text-teal-500 transition-colors cursor-default"
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-pulse" />
            </motion.header>



            {/* Hero */}
            <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 0.15 },
                        },
                    }}
                >
                    <motion.h1
                        className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight"
                        variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        Streamline Your Business
                    </motion.h1>

                    <motion.p
                        className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
                        variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        A future manager are you? Well, there's all-in-one solution for sales and inventory management.
                        Track products, manage sales, and gain valuable insights.
                    </motion.p>

                    <motion.a
                        href="/login"
                        className="mt-10 inline-block px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-teal-700 transition-transform hover:scale-105"
                        variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        Get Started
                    </motion.a>
                </motion.div>

                {/* Dashboard Images */}
                <motion.div
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } },
                    }}
                >
                    {[dashboard1, dashboard2, dashboard3].map((img, i) => (
                        <motion.div
                            key={i}
                            className="rounded-xl shadow-2xl ring-1 ring-gray-900/10 overflow-hidden"
                            variants={{
                                hidden: { scale: 0.9, opacity: 0 },
                                visible: { scale: 1, opacity: 1 },
                            }}
                            transition={{ duration: 0.6 }}
                        >
                            <img src={img} alt={`Dashboard ${i + 1}`} className="w-full h-auto" />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Vendora?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                className="relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-8 rounded-xl border shadow-lg hover:shadow-2xl transition-all duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true, amount: 0.3 }}
                            >
                                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                                    {i + 1}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{f.title}</h3>
                                <p className="mt-4 text-gray-700">{f.desc}</p>
                            </motion.div>

                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

IndexPage.layout = page => page

export default IndexPage
