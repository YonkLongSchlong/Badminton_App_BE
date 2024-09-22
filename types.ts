export class ApiResponse {
  private status: number;
  private msg?: string;
  private data?: any;

  constructor(status: number, msg?: string, data?: any) {
    this.status = status;
    this.msg = msg;
    this.data = data;
  }
}

export class ApiError {
  private status: number;
  private name: string;
  private msg: string;

  constructor(status: number, name: string, msg: string) {
    this.status = status;
    this.name = name;
    this.msg = msg;
  }
}
