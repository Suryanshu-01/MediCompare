const AuthLayout = ({ children, imageUrl }) => {
  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex md:w-1/2 h-screen items-center justify-center bg-slate-900">
        <img
          src={imageUrl}
          alt="Auth"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
