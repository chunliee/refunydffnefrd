import Image from "next/image";
import Navbar from "@/components/Navbar";
export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      <div className="h-screen px-4 py-4">
        <h1 className="font-header text-4xl">Home Page</h1>
        <div className="p-4">
          {" "}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas
          repellendus ad fuga est, ab tempore culpa hic quae nulla inventore!
        </div>
      </div>
    </>
  );
}
