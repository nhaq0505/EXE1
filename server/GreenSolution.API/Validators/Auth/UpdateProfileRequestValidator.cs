using FluentValidation;
using GreenSolution.API.DTOs.Auth;

namespace GreenSolution.API.Validators.Auth
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Phone)
                .Matches(@"^\+?[0-9]{10,15}$")
                .WithMessage("Phone number must be a valid international format (10-15 digits).")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.Address));
        }
    }
}
