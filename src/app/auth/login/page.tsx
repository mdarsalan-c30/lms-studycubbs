export const dynamic = "force-dynamic";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .login-page-wrapper {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          padding: 1.5rem;
        }
        @media (min-width: 768px) {
          .login-page-wrapper {
            padding: 2.5rem;
          }
        }
        .login-container {
          width: 100%;
          max-width: 400px;
        }
        @media (min-width: 768px) {
          .login-container {
            max-width: 800px;
          }
        }
      `}} />
      <div className="login-page-wrapper">
        <div className="login-container">
          <LoginForm />
        </div>
      </div>
    </>
  );
}

