const getTruncatedString = (string: String | null | undefined, totalCharLimit: number) => {
    if (!string) {
      return "N/A"
    }
    if (string.length <= totalCharLimit) {
      return string;
    }
    const frontEndIndex = Math.ceil(totalCharLimit / 2);
    const rearStartIndex = Math.ceil(string.length - totalCharLimit / 2);
    return `${string.slice(0, frontEndIndex)}...${string.slice(rearStartIndex, string.length)}`;
  };
  
  export default getTruncatedString;