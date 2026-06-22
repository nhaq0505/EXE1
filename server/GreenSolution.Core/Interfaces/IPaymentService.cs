using System.Threading.Tasks;
using GreenSolution.Core.Entities;

namespace GreenSolution.Core.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentLinkAsync(Order order);
        Task<bool> CancelPaymentLinkAsync(long orderCode, string reason);
    }
}
