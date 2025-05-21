// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VerificationSystem
 * @dev A contract for verifying supply chain participants and assigning roles
 * @custom:dev-run-script ./scripts/deploy_verification_system.ts
 */
contract VerificationSystem is AccessControl {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    
    // Custom errors for gas-efficient reverts
    error InvalidParticipant();
    error InvalidRole(bytes32 role);
    error AlreadyVerified(address participant);
    error NotVerified(address participant);
    
    // Participant struct to store verification details
    struct Participant {
        bytes32 role;
        bool isVerified;
        uint256 verifiedAt;
    }
    
    // Mapping to store participant information
    mapping(address => Participant) private participants;
    
    // Events
    event ParticipantVerified(address indexed participant, bytes32 indexed role);
    event VerificationRevoked(address indexed participant);
    
    /**
     * @dev Constructor sets up the admin role for the deployer
     */
    constructor() {
        // Set up the admin role
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set role hierarchy: ADMIN_ROLE is the admin of other roles
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(SUPPLIER_ROLE, ADMIN_ROLE);
    }
    
    /**
     * @dev Verifies a participant and assigns them a role
     * @param participant The address of the participant to verify
     * @param role The role to assign to the participant (MANUFACTURER_ROLE or SUPPLIER_ROLE)
     */
    function verifyParticipant(address participant, bytes32 role) external onlyRole(ADMIN_ROLE) {
        // Validate participant address
        if (participant == address(0)) {
            revert InvalidParticipant();
        }
        
        // Validate role
        if (role != MANUFACTURER_ROLE && role != SUPPLIER_ROLE) {
            revert InvalidRole(role);
        }
        
        // Check if participant is already verified
        if (participants[participant].isVerified) {
            revert AlreadyVerified(participant);
        }
        
        // Update participant information
        participants[participant] = Participant({
            role: role,
            isVerified: true,
            verifiedAt: block.timestamp
        });
        
        // Grant role in AccessControl
        _grantRole(role, participant);
        
        // Emit event
        emit ParticipantVerified(participant, role);
    }
    
    /**
     * @dev Revokes verification from a participant
     * @param participant The address of the participant to revoke verification from
     */
    function revokeVerification(address participant) external onlyRole(ADMIN_ROLE) {
        // Validate participant address
        if (participant == address(0)) {
            revert InvalidParticipant();
        }
        
        // Check if participant is verified
        Participant memory p = participants[participant];
        if (!p.isVerified) {
            revert NotVerified(participant);
        }
        
        // Store the role before we update the participant data
        bytes32 participantRole = p.role;
        
        // Update participant information
        participants[participant].isVerified = false;
        
        // Revoke role in AccessControl
        _revokeRole(participantRole, participant);
        
        // Emit event
        emit VerificationRevoked(participant);
    }
    
    /**
     * @dev Gets the status of a participant
     * @param participant The address of the participant to query
     * @return role The participant's role
     * @return isVerified Whether the participant is verified
     * @return verifiedAt When the participant was verified
     */
    function getParticipantStatus(address participant) 
        external 
        view 
        returns (bytes32 role, bool isVerified, uint256 verifiedAt) 
    {
        Participant memory p = participants[participant];
        return (p.role, p.isVerified, p.verifiedAt);
    }
    
    /**
     * @dev Checks if an address has a specific role and is verified
     * @param participant The address to check
     * @param role The role to check for
     * @return bool Whether the participant has the role and is verified
     */
    function isVerifiedForRole(address participant, bytes32 role) external view returns (bool) {
        return participants[participant].isVerified && 
               participants[participant].role == role &&
               hasRole(role, participant);
    }
    
    /**
     * @dev Gets all roles that can be assigned by the verification system
     * @return manufacturerRole The manufacturer role
     * @return supplierRole The supplier role
     */
    function getAssignableRoles() external pure returns (bytes32 manufacturerRole, bytes32 supplierRole) {
        return (MANUFACTURER_ROLE, SUPPLIER_ROLE);
    }
}