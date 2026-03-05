
import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import Chatbot from "../common/Chatbot";
const UserLayout = () => {
    return (
        <>
            {/* header*/}
            <Header />
            {/* main */}
            <main>
                <Outlet />
                <Chatbot />
            </main>
            {/* footer */}
            <Footer />
        </>
    );
};


export default UserLayout;