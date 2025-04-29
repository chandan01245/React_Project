import React, { useState } from "react";
import {
HiOutlineBars3CenterLeft,
HiOutlineMagnifyingGlass,
HiOutlineXMark,
} from "react-icons/hi2";
import acceleronlab from "./../assets/logo.png";
// Uncomment this import if SideNavGenreList is implemented
// import SideNavGenreList from "./SideNavGenreList";

const Header: React.FC = () => {
    const [toggle, setToggle] = useState <boolean> (false);
    return (
    <div className="flex items-center p-3 w-full gap-4">
        <img
        src={acceleronlab}
        width={60}
        height={60}
        className="hidden md:block"
        alt="Acceleron Lab Logo"
        />

        <div className="md:hidden">
        {!toggle ? (
            <HiOutlineBars3CenterLeft
            onClick={() => setToggle(!toggle)}
            className="text-[25px] cursor-pointer"
            />
        ) : (
            <HiOutlineXMark
            onClick={() => setToggle(!toggle)}
            className="text-[25px] cursor-pointer"
            />
        )}
        {toggle && (
            <div className="absolute z-10 bg-white mt-3">
            {/* <SideNavGenreList /> */}
            </div>
        )}
        </div>

        <div className="flex bg-slate-200 w-full p-2 rounded-full items-center px-3">
        <HiOutlineMagnifyingGlass />
        <input
            type="text"
            placeholder="Search"
            className="bg-transparent w-full outline-none pl-2 items-center rounded-full"
        />
        </div>
    </div>
    );
};

export default Header;
