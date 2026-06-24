export function Login() {
  return (
    <>
      <form name="login" method="post" action="http://localhost:3000/auth/login">
        <div>
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" />
          </label>
        </div>
        <div>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" />
          </label>
        </div>
        <button>Login</button>
      </form>

      <div>
        <p>No account? <a href="./register">Register instead</a></p>
      </div>
    </>
  );
};

export function Register() {
  return (
    <>
      <form name="register" method="post" action="http://localhost:3000/auth/register">
        <div>
          <label>
            Username
            <input name="username" type="text" autoComplete="username" />
          </label>
        </div>
        <div>
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" />
          </label>
        </div>
        <div>
          <label>
            Password
            <input name="password" type="password" autoComplete="new-password" />
          </label>
        </div>
        <button>Register</button>
      </form>

      <div>
        <p>Already have an account? <a href="./login">Login here</a></p>
      </div>
    </>
  );
};
