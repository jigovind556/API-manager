class ApiResponse {
    constructor(
        statusCode,data,message ="success"
    ) {
        this.statusCode = statusCode;
        this.data =data;
        this.message= message;
        this.success= 400<this.statusCode?false:true;
    }
}

module.exports={ApiResponse};