import {
  Box,
  Card,
  Text,
} from 'rebass';
import { Box as FlexBox } from 'reflexbox';

const VoteStatus = (props) => (
  <Card
    sx={{
      p: 1,
      borderRadius: 2,
      boxShadow: '0 0 16px rgba(0, 0, 0, .25)',
    }}
  >
    <FlexBox width={[1 / 2]} p={1}>
          <Box>
            <Text fontSize={2}>You've voted for this already!</Text>
          </Box>
    </FlexBox>
  </Card>
);

export default VoteStatus;
