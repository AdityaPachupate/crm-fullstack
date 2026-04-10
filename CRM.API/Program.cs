using CRM.API.Common.Middleware;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Extensions;
using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Notifications;
using CRM.API.Infrastructure.Persistence;
using FluentValidation;
using CRM.API.Common.Behaviors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Serilog;
using Serilog.Events;
using CRM.API.Infrastructure.Persistence.Jobs;
using CRM.API.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using DotNetEnv;

// Load .env from current directory or parent (monorepo root)
if (System.IO.File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}
else if (System.IO.File.Exists("../.env"))
{
    DotNetEnv.Env.Load("../.env");
}


var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/crm-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();



builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("NeonProductionDb")
                      ?? Environment.GetEnvironmentVariable("ConnectionStrings__NeonProductionDb");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

builder.Services.AddScoped<INotificationService, WhatsAppNotificationService>();
builder.Services.AddScoped<IBillRepository, BillRepository>();

builder.Services.AddMediatR(cfg => 
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

builder.Host.UseSerilog();
builder.Services.AddHostedService<TrashCleanupJob>();
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString!, name: "NeonDB", tags: new[] { "ready" });

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.MigrateDatabase();

app.UseCors();

app.UseSerilogRequestLogging();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();


app.MapHealthChecks("/api/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/api/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });
app.MapHealthChecks("/api/health", new HealthCheckOptions { ResponseWriter = HealthCheckExtensions.WriteResponse });

app.MapControllers();
app.MapEndpoints(typeof(Program).Assembly);

app.Run();
