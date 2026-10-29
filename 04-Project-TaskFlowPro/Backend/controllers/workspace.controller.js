import Workspace from '../models/workspace.model.js';
import User from '../models/user.model.js';

// @desc    Create a new workspace
// @route   POST /api/workspaces
export const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Workspace name is required' });
        }

        const workspace = await Workspace.create({
            name,
            description,
            owner: req.user._id,
            members: [
                {
                    user: req.user._id,
                    role: 'Admin' // Creator is automatically the Admin
                }
            ]
        });

        const populatedWorkspace = await Workspace.findById(workspace._id)
            .populate('owner', 'username email avatar')
            .populate('members.user', 'username email avatar');

        res.status(201).json(populatedWorkspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all workspaces for logged-in user
// @route   GET /api/workspaces
export const getUserWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            'members.user': req.user._id
        })
        .populate('owner', 'username email avatar')
        .populate('members.user', 'username email avatar')
        .sort({ updatedAt: -1 });

        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single workspace details by ID
// @route   GET /api/workspaces/:id
export const getWorkspaceById = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('owner', 'username email avatar')
            .populate('members.user', 'username email avatar');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Verify if user is a member of this workspace
        const isMember = workspace.members.some(
            member => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Access denied. You are not a member of this workspace.' });
        }

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add member to workspace (Admin only)
// @route   POST /api/workspaces/:id/members
export const addWorkspaceMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const workspaceId = req.params.id;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if requester is Admin of the workspace
        const requester = workspace.members.find(
            m => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
        );

        if (!requester) {
            return res.status(403).json({ message: 'Only workspace admins can add new members' });
        }

        // Find user by email
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Check if user is already a member
        const alreadyMember = workspace.members.some(
            m => m.user.toString() === userToAdd._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this workspace' });
        }

        workspace.members.push({
            user: userToAdd._id,
            role: role || 'Developer'
        });

        await workspace.save();

        const updatedWorkspace = await Workspace.findById(workspaceId)
            .populate('owner', 'username email avatar')
            .populate('members.user', 'username email avatar');

        res.json(updatedWorkspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};