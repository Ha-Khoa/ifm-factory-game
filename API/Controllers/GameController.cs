using API.Data;
using API.Models.Factory;
using API.Models.User;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

/// <summary>
/// The GameController class handles API requests related to players, their associated factories,
/// and factory machines. It provides endpoints for interacting with and managing game entities
/// such as players, their scores, money, factories, and machines.
/// </summary>
/// <remarks>
/// This controller is decorated with the [ApiController] attribute and uses the
/// ApplicationDbContext to interact with the database.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase {
#region Variables
    /// <summary>
    /// A private instance of <see cref="ApplicationDbContext"/> used for accessing the database.
    /// </summary>
    /// <remarks>
    /// This variable is utilized by the controller to perform CRUD operations on entities such as
    /// players, factories, and machines within the application.
    /// </remarks>
    private ApplicationDbContext context;
#endregion

#region Services
    // No Services
#endregion

#region Constructors
    public GameController(ApplicationDbContext context) { this.context = context; }
#endregion

#region Methods
# region Player
    /// <summary>
    /// Retrieves a list of players along with their associated factories.
    /// This method queries the database for all players and includes their
    /// related factory entities. The data is returned as a JSON response.
    /// </summary>
    /// <returns>Returns an IActionResult containing the list of players with their factories if successful.</returns>
    [HttpGet("Players")]
    public async Task<IActionResult> GetPlayerList() {
        var playersWithFactories = await context.Players
                                          .Include(p => p.Factory)
                                          .ToListAsync();

        return Ok(playersWithFactories);
    }

    /// <summary>
    /// Retrieves a specific player based on the provided identifier.
    /// This method searches for a player using the identifier, which could either represent
    /// the player's unique ID or username.
    /// If a matching player is found, their details are returned as part of the response;
    /// otherwise, a NotFound result is returned.
    /// </summary>
    /// <param name="identifier">The unique identifier or username of the player to retrieve.</param>
    /// <returns>Returns an IActionResult containing the player if found, or a NotFound result if no match is found.</returns>
    [HttpGet("Player/{identifier}")]
    public async Task<IActionResult> GetPlayer(string identifier) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if (player == null)
            return NotFound();

        return Ok(player);
    }

    /// <summary>
    /// Adds a new player to the database with the specified username.
    /// This method checks if a player with the given username already exists.
    /// If the username is unique, it creates a new player, assigns a factory to the player,
    /// and saves the changes in the database.
    /// </summary>
    /// <param name="username">The username of the player to be added.</param>
    /// <returns>Returns an IActionResult containing the newly created player object if successful, or a BadRequest response if the username already exists.</returns>
    [HttpPost("Player/{username}")]
    public async Task<IActionResult> AddPlayer(string username) {
        // Check if player exists already
        if(await GetPlayerElement(username) != null)
            return BadRequest( $"Username {username} already exists.");

        // Create and save player
        Player player = new Player() { Name = username };
        context.Players.Add(player);
        await context.SaveChangesAsync();

        // Create Factory and add it to dbContext
        Factory factory = new Factory() { PlayerId = player.Id };
        context.Factories.Add(factory);

        // Add Factory to player object
        player.Factory = factory;
        await context.SaveChangesAsync();

        return Ok(player);
    }

    /// <summary>
    /// Deletes a player based on the provided identifier.
    /// This method looks up the player using the identifier, removes the player from the database,
    /// and commits the changes to persist the deletion.
    /// </summary>
    /// <param name="identifier">The unique identifier of the player to be deleted. This can be the player's ID or name.</param>
    /// <returns>Returns an IActionResult indicating the result of the deletion. If successful, a confirmation message is returned. If the player is not found, a NotFound response is returned.</returns>
    [HttpDelete("Player/{identifier}")]
    public async Task<IActionResult> DeletePlayer(string identifier) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if (player == null)
            return NotFound();

        context.Players.Remove(player);
        await context.SaveChangesAsync();

        return Ok($"Deleted Player {player.Name}");
    }

    /// <summary>
    /// Retrieves a specific player based on the provided identifier.
    /// The identifier can be either the player's unique ID as an integer
    /// or their username as a string. The method attempts to find and
    /// return the matching player object.
    /// </summary>
    /// <param name="identifier">The identifier of the player, which can be either an integer ID or a username string.</param>
    /// <returns>Returns a Player object if a matching player is found, or null if no match exists.</returns>
    private async Task<Player?> GetPlayerElementByIdentifier(string identifier) {
        Player? player;

        if (int.TryParse(identifier, out int userId)) {
            player = await GetPlayerElement(userId);
        } else {
            player = await GetPlayerElement(identifier);
        }

        return player;
    }

    /// <summary>
    /// Retrieves a player by their username, including their associated factory and machines.
    /// This method queries the database to search for a player with the provided username
    /// and includes any related factory and machinery information in the result.
    /// </summary>
    /// <param name="username">The username of the player to retrieve.</param>
    /// <returns>Returns a Player object if a match is found, otherwise null.</returns>
    private async Task<Player?> GetPlayerElement(string username) {
        return await context.Players
                            .Include(p => p.Factory)
                            .ThenInclude(f => f.Machines)
                            .FirstOrDefaultAsync(p => p.Name == username);
    }

    /// <summary>
    /// Retrieves a player's information and includes related factory and machine details.
    /// This method queries the database to find a player by their unique identifier
    /// and fetches their associated factory, along with the factory's machines.
    /// </summary>
    /// <param name="playerId">The unique identifier of the player to retrieve.</param>
    /// <returns>Returns the Player object if found, including its related factory and machines; otherwise, null.</returns>
    private async Task<Player?> GetPlayerElement(int playerId) {
        return await context.Players
                            .Include(p => p.Factory)
                            .ThenInclude(f => f.Machines)
                            .FirstOrDefaultAsync(p => p.Id == playerId);
    }
# endregion

# region Score
    /// <summary>
    /// Updates the score of a specified player.
    /// This method retrieves the player by their unique identifier and updates their score
    /// in the database. The updated information is then saved to persist the change.
    /// </summary>
    /// <param name="identifier">The unique identifier of the player whose score is to be updated. It can be the player's ID or username.</param>
    /// <param name="score">The new score value to assign to the player.</param>
    /// <returns>Returns an IActionResult indicating the outcome of the operation. If the player is not found, returns a 404 Not Found result. If successful, returns a 200 OK result.</returns>
    [HttpPatch("Score/{identifier}/{score}")]
    public async Task<IActionResult> UpdatePlayerScore(string identifier, int score) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if ( player == null )
            return NotFound($"Player not found.");

        player.Score = score;
        await context.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Retrieves the score of a specified player.
    /// This method fetches the player identified by their unique identifier
    /// and returns their current score. If the player does not exist, a NotFound result is returned.
    /// </summary>
    /// <param name="identifier">The unique identifier of the player, which could be either their username or ID.</param>
    /// <returns>Returns an IActionResult containing the player's current score if the player is found, or a NotFound result if the player does not exist.</returns>
    [HttpGet("Score/{identifier}")]
    public async Task<IActionResult> GetPlayerScore(string identifier) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if ( player == null )
            return NotFound($"Player not found.");

        return Ok(player.Score);
    }
# endregion

# region Money
    /// Updates the money value of a specific player.
    /// This method identifies the player using the provided identifier
    /// and sets their money amount to the specified value.
    /// If the player does not exist, a "Not Found" response is returned.
    /// <param name="identifier">The unique identifier of the player to update. This can be either the player's ID or name.</param>
    /// <param name="value">The new money value to assign to the player.</param>
    /// <return>Returns an IActionResult indicating the result of the operation.
    /// If the player is found, an "Ok" response is returned. Otherwise, a "Not Found" response is returned.</return>
    [HttpPatch("Money/{identifier}/{value}")]
    public async Task<IActionResult> UpdatePlayerMoney(string identifier, int value) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if ( player == null )
            return NotFound($"Player not found.");

        if( value < 0)
            return Conflict($"There are no debts in this world! Negative values are not allowed");

        player.Money = value;
        await context.SaveChangesAsync();

        return Ok();
    }

    /// Adds a specified amount of money to a player's account.
    /// This method identifies a player by their unique identifier and increments
    /// their money by the specified value. The updated amount is saved to the database.
    /// <param name="identifier">The unique identifier of the player (e.g., username or ID).</param>
    /// <param name="value">The amount of money to add to the player's account.</param>
    /// <return>Returns an IActionResult indicating success with the updated money value or failure if the player is not found.</return>
    [HttpPatch("Money/{identifier}/Add/{value}")]
    public async Task<IActionResult> AddPlayerMoney(string identifier, int value) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if ( player == null )
            return NotFound($"Player not found.");

        if( value < 0 )
            return Conflict("Adding negativ value to the money is not allowed.");

        player.Money += value;
        await context.SaveChangesAsync();

        return Ok($"Added {value} to player money. New amount: {player.Money}");
    }

    /// <summary>
    /// Removes a specified amount of money from a player's balance.
    /// This method retrieves a player by their identifier and decreases their money balance
    /// by the specified value if the player's current balance is sufficient.
    /// If the player's balance is insufficient, a conflict response is returned.
    /// </summary>
    /// <param name="identifier">The unique identifier of the player, either the player's ID or username.</param>
    /// <param name="value">The amount of money to remove from the player's balance.</param>
    /// <returns>
    /// Returns an IActionResult indicating the outcome:
    /// - NotFound if the player does not exist.
    /// - Conflict if the player's current balance is insufficient.
    /// - Ok with the updated player balance if the operation is successful.
    /// </returns>
    [HttpPatch("Money/{identifier}/Remove/{value}")]
    public async Task<IActionResult> RemovePlayerMoney(string identifier, int value) {
        Player? player = await GetPlayerElementByIdentifier(identifier);
        if ( player == null )
            return NotFound($"Player not found.");

        if( value < 0 )
            return Conflict("Removing negativ value to the money is not allowed.");

        int money = player.Money;
        if ( (money - value) < 0 ) {
            return Conflict($"Player has not enough money. Current Money: {money}");
        }

        player.Money -= value;
        await context.SaveChangesAsync();

        return Ok($"Removed {value} from player money. New amount: {player.Money}");
    }

    /// <summary>
    /// Retrieves the money value of a specified player.
    /// This method retrieves the player's money by their identifier and
    /// returns the value if the player is found. If the player is not found,
    /// a NotFound response is returned.
    /// </summary>
    /// <param name="identifier">The unique identifier of the player.</param>
    /// <returns>Returns an IActionResult containing the player's money value if found, or a NotFound response if the player does not exist.</returns>
    [HttpGet("Money/{identifier}")]
    public async Task<IActionResult> GetPlayerMoney(string identifier) {
        Player? player = await GetPlayerElementByIdentifier(identifier);

        if ( player == null )
            return NotFound("Player not found");

        return Ok(player.Money);
    }
# endregion

#region Machine
    /// <summary>
    /// Adds a new machine to the specified factory.
    /// This method creates a new machine instance with an initial level of 1 and associates it
    /// with the factory identified by the supplied factory ID. The machine is then persisted
    /// in the database.
    /// </summary>
    /// <param name="factoryId">The unique identifier of the factory to which the machine will be added.</param>
    /// <param name="machineId">The unique identifier of the machine to be added to the factory.</param>
    /// <returns>Returns an IActionResult indicating a successful addition of the machine or a NotFound result if the factory is not found.</returns>
    [HttpPost("Machine/{factoryId}/{machineId}")]
    public async Task<IActionResult> AddMachine(int factoryId, string machineId) {
        Factory? factory = await GetFactoryElement(factoryId);

        if ( factory == null )
            return NotFound($"Factory with id {factoryId} not found.");

        Machine machine = new Machine() {
            MachineNumber = machineId,
            Level = 1,
        };
        factory.Machines.Add(machine);
        await context.SaveChangesAsync();
        return Ok();
    }

    /// <summary>
    /// Updates the level of a specified machine within a factory.
    /// This method checks if a factory and its corresponding machine exist and ensures
    /// the new level is higher than the current machine level before updating the level.
    /// </summary>
    /// <param name="factoryId">The unique identifier for the factory containing the machine.</param>
    /// <param name="machineId">The unique identifier for the machine to be updated.</param>
    /// <param name="level">The new level to assign to the machine. Must be greater than the current level.</param>
    /// <returns>
    /// Returns an IActionResult indicating the outcome of the operation:
    /// - `NotFound` if the factory or machine does not exist.
    /// - `Conflict` if the new level is not greater than the current level.
    /// - `Ok` if the machine level is successfully updated.
    /// </returns>
    [HttpPatch("Machine/{factoryId}/{machineId}/{level}")]
    public async Task<IActionResult> UpdateMachineLevel(int factoryId, int machineId, int level) {
        Factory? factory = await GetFactoryElement(factoryId);

        if ( factory == null )
            return NotFound($"Factory with id {factoryId} not found.");

        Machine? machine = factory.Machines.FirstOrDefault(m => m.Id == machineId);

        if ( machine == null )
            return NotFound($"Machine with id {machineId} not found.");


        if ( level <= machine.Level )
            return Conflict($"New machine level must be greater than current machine level. Current machine level: {machine.Level}.");

        machine.Level = level;
        await context.SaveChangesAsync();

        return Ok("Machine updated.");
    }

    /// <summary>
    /// Retrieves a machine entity from a specified factory.
    /// This method queries a factory by its ID and then searches for a machine
    /// within the factory's collection of machines based on the provided machine ID.
    /// </summary>
    /// <param name="factoryId">The unique identifier of the factory containing the machine.</param>
    /// <param name="machineId">The unique identifier of the machine to retrieve.</param>
    /// <returns>Returns an IActionResult containing the machine details if found, or a NotFound response if the factory or machine does not exist.</returns>
    [HttpGet("Machine/{factoryId}/{machineId}")]
    public async Task<IActionResult> GetMachine(int factoryId, int machineId) {
        Factory? factory = await GetFactoryElement(factoryId);

        if ( factory == null )
            return NotFound($"Factory with id {factoryId} not found.");

        Machine? machine = factory.Machines.FirstOrDefault(m => m.Id == machineId);

        if ( machine == null )
            return NotFound($"Machine with id {machineId} not found.");

        return Ok(machine);
    }
# endregion

#region Factories
    /// <summary>
    /// Retrieves a specific factory by its unique identifier.
    /// This method queries the database for a factory, including its associated player
    /// and machines, and returns the factory details if found.
    /// </summary>
    /// <param name="factoryId">The unique identifier of the factory to be retrieved.</param>
    /// <returns>Returns an IActionResult containing the factory details if found or a NotFound result if the factory does not exist.</returns>
    [HttpGet("Factory/{factoryId}")]
    public async Task<IActionResult> GetFactory(int factoryId) {
        Factory? factory = await GetFactoryElement(factoryId);

        if ( factory == null )
            return NotFound($"Factory with id {factoryId} not found.");

        return Ok(factory);
    }

    /// <summary>
    /// Retrieves a factory entity by its unique identifier from the database.
    /// The returned factory includes associated player details and its related machines.
    /// </summary>
    /// <param name="factoryId">The unique identifier of the factory to be retrieved.</param>
    /// <returns>Returns a Task containing the factory entity if found, or null otherwise.</returns>
    private async Task<Factory?> GetFactoryElement(int factoryId) {
        return await context.Factories
                            .Include(f => f.Player)
                            .Include(f => f.Machines)
                            .FirstOrDefaultAsync(f => f.Id == factoryId);
    }
#endregion
#endregion

#region Event Handlers
    // No Event Handlers
#endregion
}
