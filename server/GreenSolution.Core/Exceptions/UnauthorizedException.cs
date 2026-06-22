namespace GreenSolution.Core.Exceptions
{
    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message) : base(message, 401)
        {
        }
    }
}
