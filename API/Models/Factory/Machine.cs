using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models.Factory;

/// <summary>
/// Represents a machine entity within the system.
/// Each machine is associated with a factory and has a unique identifier, a machine number,
/// and a level indicating its current state.
/// </summary>
public class Machine {
#region Variables
    /// <summary>
    /// Gets or sets the unique identifier for the machine.
    /// This property serves as the primary key in the database.
    /// </summary>
    [Key]
    [Column(TypeName = "int")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the machine's unique alphanumeric identifier.
    /// This property is used to identify and reference the machine within the system.
    /// </summary>
    [Column(TypeName = "varchar(100)")]
    public string MachineNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the operational level of the machine.
    /// This property specifies the current state or progression level of the machine in the system.
    /// </summary>
    [Column(TypeName = "int")]
    public int Level { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the factory associated with the machine.
    /// Serves as a foreign key linking the machine to its parent factory.
    /// </summary>
    [ForeignKey("Factory")]
    public int FactoryId { get; set; }

    /// <summary>
    /// Represents a factory entity within the system.
    /// </summary>
    /// <remarks>
    /// A factory is associated with a specific player and manages a collection of machines.
    /// It establishes a one-to-one relationship with a player and a one-to-many relationship with machines.
    /// </remarks>
    public Factory? Factory { get; set; }
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