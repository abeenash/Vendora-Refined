import { usePage } from "@inertiajs/react";
import Card from "./Card";
import { Users, ShoppingCart, Package, IndianRupeeIcon } from "lucide-react";

const InfoCards = () => {
    const {products, sales, userCount} = usePage().props;
    return (
        <section className="py-4">
            <div className="container-xl lg:container m-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg">
                    <Card title="Users" value={userCount} Icon={Users} />
                    <Card
                        title="Total Sales"
                        value={sales.total_price}
                        growth="+12.5"
                        Icon={IndianRupeeIcon}
                    />
                    <Card
                        title="Products"
                        value={products.total}
                        Icon={Package}
                    />
                    <Card
                        title="Today's Sales"
                        value={sales.today_sales}
                        growth="+3.5"
                        Icon={ShoppingCart}
                    />
                </div>
            </div>
        </section>
    );
};

export default InfoCards;
