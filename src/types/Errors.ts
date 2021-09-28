class UserNotFoundError extends Error{
	public userId: string;
	public serverId: string;

	constructor(message: string, userId: string, serverId: string) {
		super(message);

		Object.setPrototypeOf(this, UserNotFoundError.prototype)
		this.name = "UserNotFoundError";
		this.userId = userId;
		this.serverId = serverId;
		this.stack = (<any> new Error()).stack;

	}
} export default UserNotFoundError;