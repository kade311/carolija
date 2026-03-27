using carolijaAPI;
using carolijaAPI.Controllers;
using carolijaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace carolijaAPI.Tests.Controllers;

public class ProductsControllerTests
{
    [Fact]
    public async Task GetProducts_AppliesPagingMetadataAndClampsInvalidPagingArguments()
    {
        await using var context = CreateContext();
        var activeCategory = new Category { CategoryID = 1, CategoryName = "Aktivna", IsDeleted = false };
        context.Categories.Add(activeCategory);
        context.Products.AddRange(Enumerable.Range(1, 3).Select(index =>
            new Product
            {
                ProductId = index,
                ProductName = $"Proizvod {index}",
                CategoryID = 1,
                Category = activeCategory,
                ProductPrice = 10m + index,
                Available = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-index)
            }));
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);

        var actionResult = await controller.GetProducts(pageNumber: 0, pageSize: 100);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var payload = Assert.IsType<PagedResultDto<ProductDto>>(okResult.Value);

        Assert.Equal(1, payload.PageNumber);
        Assert.Equal(50, payload.PageSize);
        Assert.Equal(3, payload.TotalCount);
        Assert.Equal(3, payload.Items.Count);
    }

    [Fact]
    public async Task GetProducts_ExcludesUnavailableProductsAndProductsFromDeletedCategories()
    {
        await using var context = CreateContext();
        var visibleCategory = new Category { CategoryID = 1, CategoryName = "Vidljiva", IsDeleted = false };
        var deletedCategory = new Category { CategoryID = 2, CategoryName = "Obrisana", IsDeleted = true };
        context.Categories.AddRange(visibleCategory, deletedCategory);
        context.Products.AddRange(
            new Product { ProductId = 1, ProductName = "Aktivan proizvod", CategoryID = 1, Category = visibleCategory, ProductPrice = 15m, Available = true },
            new Product { ProductId = 2, ProductName = "Nedostupan proizvod", CategoryID = 1, Category = visibleCategory, ProductPrice = 17m, Available = false },
            new Product { ProductId = 3, ProductName = "Proizvod obrisane kategorije", CategoryID = 2, Category = deletedCategory, ProductPrice = 20m, Available = true }
        );
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);

        var actionResult = await controller.GetProducts();
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var payload = Assert.IsType<PagedResultDto<ProductDto>>(okResult.Value);

        Assert.Single(payload.Items);
        Assert.Equal("Aktivan proizvod", payload.Items.Single().ProductName);
        Assert.DoesNotContain(payload.Items, p => p.CategoryID == 2);
        Assert.DoesNotContain(payload.Items, p => p.ProductName == "Nedostupan proizvod");
    }

    [Fact]
    public async Task GetProduct_ReturnsImagesOrderedWithMainImageFirst()
    {
        await using var context = CreateContext();
        var category = new Category { CategoryID = 1, CategoryName = "Igracke", IsDeleted = false };
        var product = new Product
        {
            ProductId = 10,
            ProductName = "Medo",
            CategoryID = 1,
            Category = category,
            ProductPrice = 25m,
            Available = true,
            ProductImages =
            [
                new ProductImage { ImageID = 1, ImageUrl = "sporedna.jpg", isMain = false },
                new ProductImage { ImageID = 2, ImageUrl = "glavna.jpg", isMain = true }
            ]
        };

        context.Categories.Add(category);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);

        var actionResult = await controller.GetProduct(10);
        var okResult = Assert.IsType<OkObjectResult>(actionResult);
        var payload = Assert.IsType<ProductDto>(okResult.Value);

        Assert.Equal(2, payload.ProductImages.Count);
        Assert.True(payload.ProductImages.First().IsMain);
        Assert.Equal("glavna.jpg", payload.ProductImages.First().ImageUrl);
    }

    [Fact]
    public async Task RestoreProduct_ReturnsBadRequest_WhenCategoryIsDeleted()
    {
        await using var context = CreateContext();
        var deletedCategory = new Category { CategoryID = 1, CategoryName = "Obrisana", IsDeleted = true };
        var product = new Product
        {
            ProductId = 20,
            ProductName = "Vracanje nije dozvoljeno",
            CategoryID = 1,
            Category = deletedCategory,
            ProductPrice = 30m,
            Available = false
        };

        context.Categories.Add(deletedCategory);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);

        var actionResult = await controller.RestoreProduct(20);
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult);

        Assert.NotNull(badRequestResult.Value);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}
