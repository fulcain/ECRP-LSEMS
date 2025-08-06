"use client";

import { Bounce, ToastContainer, toast } from "react-toastify";

export default function Home() {
	return (
		<>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
			/>

					<div className="mt-20 flex flex-col items-center justify-center gap-10" >quick links</div>
		</>
	)
}
