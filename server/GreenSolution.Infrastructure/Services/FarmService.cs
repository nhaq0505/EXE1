using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GreenSolution.Core.DTOs;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Interfaces;
using GreenSolution.Core.Utils;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenSolution.Infrastructure.Services
{
    public class FarmService : IFarmService
    {
        private readonly AppDbContext _context;

        public FarmService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FarmResponse>> GetAllAsync(string? search)
        {
            var query = _context.Farms.Where(f => f.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(f => f.Name.ToLower().Contains(lowerSearch));
            }

            var farms = await query.ToListAsync();
            return farms.Select(MapToResponse);
        }

        public async Task<IEnumerable<FarmResponse>> GetFeaturedAsync()
        {
            var farms = await _context.Farms
                .Where(f => f.IsActive)
                .OrderByDescending(f => f.Rating)
                .Take(3)
                .ToListAsync();

            return farms.Select(MapToResponse);
        }

        public async Task<FarmResponse?> GetByIdAsync(Guid id)
        {
            var stringId = GuidHelper.ResolveGuidToId(id);
            var farm = await _context.Farms
                .FirstOrDefaultAsync(f => f.Id == stringId && f.IsActive);

            if (farm == null)
            {
                return null;
            }

            return MapToResponse(farm);
        }

        private static FarmResponse MapToResponse(Farm farm)
        {
            return new FarmResponse
            {
                Id = GuidHelper.ResolveIdToGuid(farm.Id),
                Name = farm.Name,
                Image = farm.Image,
                Description = farm.Description,
                Location = farm.Location,
                Rating = (decimal)farm.Rating,
                VideoUrl = farm.VideoUrl,
                IsActive = farm.IsActive
            };
        }
    }
}
