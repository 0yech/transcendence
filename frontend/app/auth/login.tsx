export function LoginForm() {
  return (
    <>
      <form action="http://127.0.0.1:3000/auth/login" method="post">
        <div>
          <label htmlFor="username">Enter your username: </label>
          <input type="text" name="username" id="username" required />
        </div>
        <div>
          <label htmlFor="password">Enter your password: </label>
          <input type="password" name="password" id="password" required />
        </div>
        <div>
          <input type="submit" value="Login" />
        </div>
      </form>
    </>
  );
}
