contract Upload {
    
    string dgst;
    
    /* This runs when the contract is executed */
    function file_dgst(string file_hash) public {
        dgst = file_hash;
    }

    /* return function */
    function show_dgst() constant returns (string) {
        return dgst;
    }
}
