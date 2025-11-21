using API.Models.Factory;
using API.Models.User;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

/// <summary>
/// Represents the database context for the application.
/// </summary>
/// <remarks>
/// This class provides access to the application's database and serves as a bridge between the application logic
/// and the underlying database. It inherits from the <see cref="DbContext"/> base class provided by Entity Framework Core.
/// The context includes DbSet properties for managing entities related to players, factories, and machines.
/// It is configured to use options passed during its initialization, allowing dependency injection to manage settings.
/// </remarks>
public class ApplicationDbContext : DbContext {
#region Variables
    /// <summary>
    /// Represents the set of players in the system.
    /// </summary>
    /// <remarks>
    /// This property maps to the `Player` entities in the database and provides access to the collection of players.
    /// Players are managed in the database and have relationships with other entities such as factories.
    /// </remarks>
    public DbSet<Player> Players { get; set; }


    /// <summary>
    /// Represents the collection of factories in the system.
    /// </summary>
    /// <remarks>
    /// This property maps to the `Factory` entities in the database and provides access to the collection of factories.
    /// Factories are associated with players in a one-to-one relationship and can contain multiple machines.
    /// </remarks>
    public DbSet<Factory> Factories { get; set; }


    /// <summary>
    /// Represents the collection of machines managed in the system.
    /// </summary>
    /// <remarks>
    /// This property maps to the `Machine` entities in the database and provides access to the collection of machines.
    /// Machines are associated with factories and contain attributes such as machine number and level,
    /// which define their configuration and state within the system.
    /// </remarks>
    public DbSet<Machine> Machines { get; set; }
#endregion

#region Services
    // No Services
#endregion

#region Constructors
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
#endregion

#region Methods
    // No Methods
#endregion

#region Event Handlers
    // No Event Handlers
#endregion
}
