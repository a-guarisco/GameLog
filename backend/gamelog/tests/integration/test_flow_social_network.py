from fastapi import status


class TestSocialNetworkFlow:
    """Section B3: Social Network, Friend Requests, Notifications & State Transitions."""

    def test_complete_friendship_lifecycle_flow(
        self,
        auth_client_factory,
        seed_helpers,
    ):
        """Test full social flow: Search -> Add Friend -> Notify -> Accept -> Friend List."""
        user_a = seed_helpers.create_user("alice")
        user_b = seed_helpers.create_user("bob")

        client_a = auth_client_factory(user_a)
        client_b = auth_client_factory(user_b)

        # 1. User A searches for User B
        res_search = client_a.get(f"/users/search?q={user_b.username}")
        assert res_search.status_code == status.HTTP_200_OK
        search_results = res_search.json()
        assert len(search_results) == 1
        assert search_results[0]["user"]["username"] == "bob"
        assert search_results[0]["friendship"]["friendship_status"] is None

        # 2. User A sends friend request to User B
        res_add = client_a.post(
            "/users/add_friend",
            json={"addressee_id": str(user_b.id)},
        )
        assert res_add.status_code == status.HTTP_201_CREATED
        friendship_data = res_add.json()
        friendship_id = friendship_data["friendship_id"]

        # 3. User A attempts duplicate friend request -> 409 Conflict
        res_dup = client_a.post(
            "/users/add_friend",
            json={"addressee_id": str(user_b.id)},
        )
        assert res_dup.status_code == status.HTTP_409_CONFLICT

        # 4. User B checks incoming friend requests
        res_b_list = client_b.get("/users/friend_list")
        assert res_b_list.status_code == status.HTTP_200_OK
        b_friends = res_b_list.json()
        pending_incoming = [f for f in b_friends if f["friendship"]["friendship_status"] == "pending_incoming"]
        assert len(pending_incoming) == 1
        assert pending_incoming[0]["user"]["username"] == "alice"

        # 5. User B accepts the friend request
        res_accept = client_b.post(
            "/users/manage_friendship",
            json={"friendship_id": friendship_id, "action": "ACCEPT"},
        )
        assert res_accept.status_code == status.HTTP_200_OK

        # 6. Both users verify mutual friendship in friend list
        res_a_final = client_a.get("/users/friend_list")
        res_b_final = client_b.get("/users/friend_list")

        a_accepted = [f for f in res_a_final.json() if f["friendship"]["friendship_status"] == "accepted"]
        b_accepted = [f for f in res_b_final.json() if f["friendship"]["friendship_status"] == "accepted"]

        assert len(a_accepted) == 1
        assert a_accepted[0]["user"]["username"] == "bob"
        assert len(b_accepted) == 1
        assert b_accepted[0]["user"]["username"] == "alice"

    def test_friendship_rejection_and_block_flow(
        self,
        auth_client_factory,
        seed_helpers,
    ):
        """Test reject, block, and unblock transitions."""
        user_a = seed_helpers.create_user("charlie")
        user_b = seed_helpers.create_user("david")

        client_a = auth_client_factory(user_a)
        client_b = auth_client_factory(user_b)

        # 1. User A sends friend request
        res_add = client_a.post(
            "/users/add_friend",
            json={"addressee_id": str(user_b.id)},
        )
        friendship_id = res_add.json()["friendship_id"]

        # 2. User B rejects the request (which deletes the pending friendship)
        res_reject = client_b.post(
            "/users/manage_friendship",
            json={"friendship_id": friendship_id, "action": "REJECT"},
        )
        assert res_reject.status_code == status.HTTP_200_OK

        # 3. User B blocks User A using target_user_id
        res_block = client_b.post(
            "/users/manage_friendship",
            json={"target_user_id": str(user_a.id), "action": "BLOCK"},
        )
        assert res_block.status_code == status.HTTP_200_OK
        block_data = res_block.json()
        blocked_friendship_id = block_data["friendship_id"]

        # 4. User B unblocks User A
        res_unblock = client_b.post(
            "/users/manage_friendship",
            json={"friendship_id": blocked_friendship_id, "action": "UNBLOCK"},
        )
        assert res_unblock.status_code == status.HTTP_200_OK
