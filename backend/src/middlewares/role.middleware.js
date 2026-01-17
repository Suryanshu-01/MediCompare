
const roleMiddleware=(...allowerRoles)=>{
    return (req,res,next)=>{
        try {
            if(!req.user || !req.user.role){
                return res.status(401).json({
                    success:false,
                    message:"Unauthorized access",
                })
            }

            const {role}=req.user;

            if(!allowerRoles.includes(role)){
                return res.status(403).json({
                    success:false,
                    message:"Access denied. Insufficient Permission",
                })
            }

            next()
        } catch (error) {
           console.log("Role middleware error");
           return res.status(500).json({
            success:false,
            message:"Internal error occur",
           });
        }
    }
}

export default roleMiddleware;