using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Models.User;

namespace API.Models.Factory;

/// <summary>
/// Represents a factory entity in the game system.
/// </summary>
/// <remarks>
/// This class models a factory, which is associated with a specific player and contains multiple machines.
/// It establishes a one-to-one relationship with a player and a one-to-many relationship with machines.
/// </remarks>
public class Factory {
#region Variables
    /// <summary>
    /// Gets or sets the unique identifier for the factory.
    /// </summary>
    /// <remarks>
    /// This property serves as the primary key for the <see cref="Factory"/> entity.
    /// It is also used as a foreign key in the one-to-one relationship with the <see cref="Player"/> entity.
    /// </remarks>
    [Key]
    [Column(TypeName = "int")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the associated player.
    /// </summary>
    /// <remarks>
    /// This property serves as both the primary key for the one-to-one relationship between the <see cref="Factory"/> and <see cref="Player"/> entities,
    /// as well as the foreign key referencing the player's unique identifier.
    /// </remarks>
    [ForeignKey("Player")]
    [Column(TypeName = "int")]
    public int PlayerId { get; set; }

    /// <summary>
    /// Represents a player entity in the game system.
    /// </summary>
    /// <remarks>
    /// This class models a player within the system, serving as a key entity that is associated with a <see cref="Factory"/> in a one-to-one relationship.
    /// It holds the unique identifier for each player and facilitates maintaining associations with other entities.
    /// </remarks>
    public Player Player { get; set; }

    /// <summary>
    /// Gets or sets the collection of machines associated with the factory.
    /// </summary>
    /// <remarks>
    /// This navigation property represents the one-to-many relationship between the <see cref="Factory"/> entity
    /// and the <see cref="Machine"/> entity. Each factory can have multiple machines.
    /// </remarks>
    public ICollection<Machine> Machines { get; set; }

#endregion

#region Services
    // No Services
#endregion

#region Constructors
    // No Constructors
#endregion

#region Methods
    // No Methods
#endregion

#region Event Handlers
    // No Event Handlers
#endregion
}
