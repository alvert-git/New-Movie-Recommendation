
import { Outlet } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
const UserLayout = () => {
    return (
        <>
            {/* header*/}
            <Header />
           {/* main */}
            <main>
                <Outlet/>
            </main>
            {/* footer */}
            <Footer/>
        </>
    );
};


export default UserLayout;