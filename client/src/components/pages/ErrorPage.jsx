import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex items-center justify-center w-full h-screen text-white bg-black">
      <div className="flex flex-col gap-4">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>Error: {error.statusText || error.message}</i>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
