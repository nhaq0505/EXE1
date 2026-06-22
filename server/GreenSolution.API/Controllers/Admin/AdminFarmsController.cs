using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GreenSolution.Infrastructure.Data;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Utils;
using GreenSolution.API.DTOs;
using GreenSolution.API.DTOs.Admin;

namespace GreenSolution.API.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin/farms")]
    [ApiController]
    public class AdminFarmsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminFarmsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var farms = await _context.Farms.ToListAsync();
            var response = farms.Select(f => new FarmResponse
            {
                Id = GuidHelper.ToGuid(f.Id),
                Name = f.Name,
                Image = f.Image,
                Description = f.Description,
                Location = f.Location,
                Rating = (decimal)f.Rating,
                VideoUrl = f.VideoUrl,
                IsActive = f.IsActive
            });
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFarmRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var newGuid = Guid.NewGuid();
            var farm = new Farm
            {
                Id = GuidHelper.FromGuid(newGuid),
                Name = request.Name,
                Image = request.Image,
                Description = request.Description,
                Location = request.Location,
                Rating = (double)request.Rating,
                VideoUrl = request.VideoUrl,
                IsActive = true
            };

            _context.Farms.Add(farm);
            await _context.SaveChangesAsync();

            var response = new FarmResponse
            {
                Id = newGuid,
                Name = farm.Name,
                Image = farm.Image,
                Description = farm.Description,
                Location = farm.Location,
                Rating = (decimal)farm.Rating,
                VideoUrl = farm.VideoUrl,
                IsActive = farm.IsActive
            };

            return CreatedAtAction(nameof(GetAll), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFarmRequest request)
        {
            if (request == null)
            {
                return BadRequest("Yêu cầu không hợp lệ.");
            }

            var stringId = GuidHelper.FromGuid(id);
            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == stringId);
            if (farm == null)
            {
                return NotFound(new { message = "Không tìm thấy trang trại." });
            }

            farm.Name = request.Name;
            farm.Image = request.Image;
            farm.Description = request.Description;
            farm.Location = request.Location;
            farm.Rating = (double)request.Rating;
            farm.VideoUrl = request.VideoUrl;
            farm.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            var response = new FarmResponse
            {
                Id = id,
                Name = farm.Name,
                Image = farm.Image,
                Description = farm.Description,
                Location = farm.Location,
                Rating = (decimal)farm.Rating,
                VideoUrl = farm.VideoUrl,
                IsActive = farm.IsActive
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var stringId = GuidHelper.FromGuid(id);
            var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == stringId);
            if (farm == null)
            {
                return NotFound(new { message = "Không tìm thấy trang trại." });
            }

            farm.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa mềm trang trại thành công." });
        }
    }
}
